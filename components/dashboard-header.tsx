// "use client"

// import { useEffect, useState } from "react"
// import Link from "next/link"
// import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

// type Breadcrumb = {
//   label: string
//   href?: string
// }

// interface DashboardHeaderProps {
//   breadcrumbs: Breadcrumb[]
//   userName: string
//   collapsed: boolean
//   onToggle: () => void
// }

// /* ---------- Greeting Helper ---------- */
// function getGreeting() {
//   const hour = new Date().getHours()

//   if (hour < 12) return "Good Morning"
//   if (hour < 17) return "Good Afternoon"
//   return "Good Evening"
// }

// export function DashboardHeader({
//   breadcrumbs,
//   userName,
//   collapsed,
//   onToggle,
// }: DashboardHeaderProps) {
//   const [greeting, setGreeting] = useState("")

//   // ✅ Run only on client → avoids hydration mismatch
//   useEffect(() => {
//     setGreeting(getGreeting())
//   }, [])

//   return (
//     <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#dbdfe6] dark:border-gray-800 bg-gray-100 dark:bg-[#101622]/80 backdrop-blur-md px-10 h-18 sticky top-0">

//       {/* ================= LEFT ================= */}
//       <div className="flex items-center gap-4">
//         {/* Sidebar Toggle */}
//         <button
//           onClick={onToggle}
//           className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 -ml-12"
//         >
//           {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
//         </button>

//         {/* Breadcrumbs */}
//         <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
//           {breadcrumbs.map((crumb, index) => (
//             <div key={index} className="flex items-center gap-2">
//               {index !== 0 && <span>/</span>}
//               {crumb.href ? (
//                 <Link
//                   href={crumb.href}
//                   className="hover:text-[#135bec] transition-colors"
//                 >
//                   {crumb.label}
//                 </Link>
//               ) : (
//                 <span className="text-slate-900 dark:text-white font-medium">
//                   {crumb.label}
//                 </span>
//               )}
//             </div>
//           ))}
//         </nav>
//       </div>

//       {/* ================= RIGHT ================= */}
//       <div className="flex items-center gap-6">
//         <div>
//           <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
//             {greeting && `${greeting}, ${userName}`}
//           </h1>

//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Subscription: <span className="font-medium">Platinum</span>
//           </p>
//         </div>
//       </div>
//     </header>
//   )
// }
"use client"

import { Bell, ChevronDown, ChevronLeft, ChevronRight, FileText, Folder, LogOut, Plus, User } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useUserIdentity } from "@/lib/use-user-identity"
import { useProject } from "@/app/context/ProjectContext"
import axiosInstance from "@/lib/axiosinstance"
import { extractProjectFromResponse, extractProjectsFromResponse } from "@/lib/project-api"
import { useAuthStore, useServiceSelectionStore, useUserProfileStore } from "@/lib/zustand"
import { useResolvedServiceSelection } from "@/lib/use-service-selection"
import { resolveProjectServiceName, useServiceCatalog } from "@/lib/use-service-catalog"

type Breadcrumb = {
  label: string
  href?: string
}

type ProjectService = {
  serviceId?: string
  subServiceId?: string
  title?: string
  serviceName?: string
  description?: string
  image?: string
}

type ProjectCurrentStage = {
  stageId?: string
  route?: string
}

type UserProject = {
  _id?: string
  projectId: string
  services?: ProjectService[]
  subServices?: ProjectService[]
  status?: string
  currentStep?: number
  currentStage?: ProjectCurrentStage | null
}

type ProjectsApiResponse = {
  success?: boolean
  message?: string
  data?: UserProject[]
}

const SELECTED_PROJECT_STORAGE_KEY = "selectedProjectId"
const SELECTED_PROJECT_STAGE_STORAGE_KEY = "selectedProjectStageId"
const PLANS_STAGE_ROUTE = "/dashboard?stage=plans"
const IDENTITY_STORAGE_KEY = "currentProfileIdentity"

const getPrimaryProjectService = (project?: UserProject | null) =>
  project?.subServices?.[0] ?? project?.services?.[0]

const buildProjectServiceSelection = (
  service: ProjectService | null | undefined,
  resolvedServiceName: string | null
) => {
  if (!service) return null

  return {
    serviceId: service.serviceId || service.subServiceId,
    parentServiceId: service.serviceId,
    subServiceId: service.subServiceId,
    serviceTitle: service.serviceName || resolvedServiceName || service.title,
    plan: resolvedServiceName || service.title || service.serviceName,
    pricingPlan: undefined,
    pricingPlanDescription: undefined,
    price: undefined,
    initialCharge: undefined,
    subsequentCharge: undefined,
    category: service.serviceName || resolvedServiceName || undefined,
    description: service.description,
    image: service.image,
  }
}

interface DashboardHeaderProps {
  breadcrumbs: Breadcrumb[]
  userName: string
  collapsed: boolean
  onToggle: () => void
}

export default function DashboardHeader({
  breadcrumbs,
  userName,
  collapsed,
  onToggle,
}: DashboardHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProjectOpen, setIsProjectOpen] = useState(false)
  const [projects, setProjects] = useState<UserProject[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const profileRef = useRef<HTMLDivElement | null>(null)
  const projectRef = useRef<HTMLDivElement | null>(null)
  const { fullName, email, profilePictureUrl, userId } = useUserIdentity()
  const { data, updateSection, resetProject } = useProject()
  const serviceSelection = useResolvedServiceSelection(data.service)
  const setServiceSelection = useServiceSelectionStore((state) => state.setSelection)
  const clearServiceSelection = useServiceSelectionStore((state) => state.clearSelection)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const clearProfile = useUserProfileStore((state) => state.clearProfile)
  const serviceLabelMap = useServiceCatalog()
  const displayName = fullName || userName || "User"
  const displayEmail = email || "No email available"
  const avatarSrc = profilePictureUrl || "/profile.jpg"
  const breadcrumbTrail = breadcrumbs.filter((crumb) => Boolean(crumb.label))
  const selectedProjectId = data.eligibility?.projectId ?? null
  const selectedProject = projects.find((project) => project.projectId === selectedProjectId)
  const selectedProjectService = getPrimaryProjectService(selectedProject)
  const selectedProjectLabel =
    resolveProjectServiceName(selectedProjectService, serviceLabelMap) ||
    serviceSelection?.plan ||
    serviceSelection?.serviceTitle ||
    selectedProjectId ||
    null
  const hasProjects = projects.length > 0
  const hasSingleProject = projects.length === 1
  const singleProject = hasSingleProject ? projects[0] : null

  const getProjectLabel = (project: UserProject) => {
    const service = getPrimaryProjectService(project)
    return resolveProjectServiceName(service, serviceLabelMap) || project.projectId
  }

  const persistSelectedProject = (project: UserProject) => {
    const service = getPrimaryProjectService(project)

    updateSection("eligibility", {
      ...(data.eligibility || {}),
      projectId: project.projectId,
      projectStageId: project.currentStage?.stageId,
    })

    if (service?.serviceId || service?.subServiceId || service?.title || service?.serviceName) {
      const resolvedServiceName = resolveProjectServiceName(service, serviceLabelMap)
      const nextSelection = buildProjectServiceSelection(service, resolvedServiceName)

      if (nextSelection) {
        updateSection("service", nextSelection)
        setServiceSelection(nextSelection)
      }
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, project.projectId)
      window.sessionStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
      if (project.currentStage?.stageId) {
        window.localStorage.setItem(SELECTED_PROJECT_STAGE_STORAGE_KEY, project.currentStage.stageId)
        window.sessionStorage.removeItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)
      }
    }
  }

  useEffect(() => {
    setIsProfileOpen(false)
    setIsProjectOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false)
      }

      if (projectRef.current && !projectRef.current.contains(target)) {
        setIsProjectOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    let isCancelled = false

    const fetchProjects = async () => {
      setIsLoadingProjects(true)
      setProjectsError(null)

      try {
        const response = await axiosInstance.get<ProjectsApiResponse>("/projects", {
          params: { userId },
        })

        if (isCancelled) return

        const filteredProjects = extractProjectsFromResponse(response.data)
        setProjects(filteredProjects)

        if (filteredProjects.length === 1) {
          persistSelectedProject(filteredProjects[0])
        }
      } catch {
        if (!isCancelled) {
          setProjects([])
          setProjectsError("Unable to load projects")
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingProjects(false)
        }
      }
    }

    void fetchProjects()

    return () => {
      isCancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (data.eligibility?.projectId) return

    const storedProjectId =
      window.localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY) ||
      window.sessionStorage.getItem(SELECTED_PROJECT_STORAGE_KEY)

    if (!storedProjectId) return

    updateSection("eligibility", {
      ...(data.eligibility || {}),
      projectId: storedProjectId,
    })
  }, [data.eligibility?.projectId])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (data.eligibility?.projectStageId) return

    const storedProjectStageId =
      window.localStorage.getItem(SELECTED_PROJECT_STAGE_STORAGE_KEY) ||
      window.sessionStorage.getItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)

    if (!storedProjectStageId) return

    updateSection("eligibility", {
      ...(data.eligibility || {}),
      projectStageId: storedProjectStageId,
    })
  }, [data.eligibility?.projectStageId])

  useEffect(() => {
    if (!selectedProjectId) return
    const matchingProject = projects.find((project) => project.projectId === selectedProjectId)
    if (!matchingProject) return

    const service = getPrimaryProjectService(matchingProject)
    if (!service) return
    const resolvedServiceName = resolveProjectServiceName(service, serviceLabelMap)
    const nextSelection = buildProjectServiceSelection(service, resolvedServiceName)

    if (!nextSelection) return

    updateSection("service", nextSelection)
    setServiceSelection(nextSelection)
  }, [projects, selectedProjectId, serviceLabelMap, setServiceSelection, updateSection])

  const handleProjectSelect = async (project: UserProject) => {
    persistSelectedProject(project)
    setIsProjectOpen(false)

    try {
      const response = await axiosInstance.get<{
        data?: UserProject
      }>(`/projects/${project.projectId}`)

      const detailedProject = extractProjectFromResponse(response.data) ?? project
      persistSelectedProject(detailedProject)
    } catch {
      // Keep the selected project in context/storage even if the detail fetch fails.
    }

    router.push("/dashboard")
  }

  const handleStartNewProject = () => {
    const preservedServiceSelection =
      serviceSelection &&
      (serviceSelection.serviceId ||
        serviceSelection.subServiceId ||
        serviceSelection.serviceTitle ||
        serviceSelection.plan)
        ? {
            serviceId: serviceSelection.serviceId,
            parentServiceId: serviceSelection.parentServiceId,
            subServiceId: serviceSelection.subServiceId,
            serviceTitle: serviceSelection.serviceTitle,
            plan: serviceSelection.plan,
            pricingPlan: undefined,
            pricingPlanDescription: undefined,
            price: undefined,
            initialCharge: undefined,
            subsequentCharge: undefined,
            category: serviceSelection.category,
            description: serviceSelection.description,
            image: serviceSelection.image,
          }
        : null

    updateSection("eligibility", {
      formData: undefined,
      projectId: undefined,
      projectStageId: undefined,
      isDraft: undefined,
      draftSavedAt: undefined,
      propertyDetails: undefined,
      dimensions: undefined,
      constraints: undefined,
      isEligible: undefined,
      completedAt: undefined,
    })

    updateSection(
      "service",
      preservedServiceSelection ?? {
        serviceId: undefined,
        parentServiceId: undefined,
        subServiceId: undefined,
        serviceTitle: undefined,
        plan: undefined,
        pricingPlan: undefined,
        pricingPlanDescription: undefined,
        price: undefined,
        initialCharge: undefined,
        subsequentCharge: undefined,
        category: undefined,
        description: undefined,
        image: undefined,
      }
    )

    if (preservedServiceSelection) {
      setServiceSelection(preservedServiceSelection)
    } else {
      clearServiceSelection()
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
      window.sessionStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
      window.localStorage.removeItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)
      window.sessionStorage.removeItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)
    }

    // router.push(preservedServiceSelection ? PLANS_STAGE_ROUTE : "/services")
    router.push("/services")
  }

  const handleLogout = () => {
    clearAuth()
    clearProfile()
    clearServiceSelection()
    resetProject()
    setProjects([])
    setIsProfileOpen(false)
    setIsProjectOpen(false)

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
      window.sessionStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
      window.localStorage.removeItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)
      window.sessionStorage.removeItem(SELECTED_PROJECT_STAGE_STORAGE_KEY)
      window.sessionStorage.removeItem(IDENTITY_STORAGE_KEY)
    }

    router.push("/")
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[linear-gradient(180deg,rgba(5,11,24,0.96),rgba(9,18,38,0.9))] backdrop-blur-xl">
      <div className="mx-auto max-w-8xl px-4 sm:px-6">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">

          {/* ================= LEFT ================= */}
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">

            {/* Sidebar Toggle */}
            <button
              onClick={onToggle}
              className="rounded-md p-2 text-slate-200 transition hover:bg-white/10"
              aria-label="Toggle Sidebar"
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>

            {breadcrumbTrail.length > 0 ? (
              <nav className="hidden min-w-0 items-center gap-2 text-sm text-slate-400 md:flex">
                {breadcrumbTrail.map((crumb, index) => (
                  <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                    {index > 0 ? <span>/</span> : null}
                    {crumb.href ? (
                        <Link href={crumb.href} className="transition hover:text-blue-300">
                        {crumb.label}
                      </Link>
                    ) : (
                        <span className="font-medium text-white">{crumb.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            ) : null}
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex flex-1 flex-wrap items-center justify-end gap-3 sm:gap-4 lg:flex-none">
            {/* Project Selector */}
            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="relative max-w-full" ref={projectRef}>
                {!hasProjects ? (
                  <button
                    type="button"
                    onClick={handleStartNewProject}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#135BEC] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#2A6BF0]"
                  >
                    <Folder className="h-4 w-4 shrink-0" />
                    <span>New Project</span>
                  </button>
                ) : hasSingleProject ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (singleProject) {
                        void handleProjectSelect(singleProject)
                      }
                    }}
                    className="flex max-w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 backdrop-blur-xl transition hover:border-blue-400/30 hover:bg-white/10 sm:max-w-[320px]"
                    aria-label={`Open project ${selectedProjectLabel || singleProject?.projectId || ""}`}
                  >
                    <Folder className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="truncate">
                      Project: {selectedProjectLabel || singleProject?.projectId}
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsProjectOpen((prev) => !prev)}
                      className="flex max-w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 backdrop-blur-xl transition hover:border-blue-400/30 hover:bg-white/10 sm:max-w-[280px]"
                      aria-haspopup="menu"
                      aria-expanded={isProjectOpen}
                    >
                      <Folder className="h-4 w-4 shrink-0 text-blue-600" />
                      <span className="truncate">
                        Project: {selectedProjectLabel || "Select project"}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>

                    {isProjectOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 mt-3 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,32,0.96),rgba(11,23,44,0.94))] shadow-2xl backdrop-blur-xl"
                      >
                        <div className="border-b border-white/10 px-4 py-3">
                          <p className="text-sm font-semibold text-white">Projects</p>
                          <p className="text-xs text-slate-400">
                            Select a project to continue
                          </p>
                        </div>

                        <div className="max-h-80 overflow-y-auto py-2">
                          {isLoadingProjects && (
                            <p className="px-4 py-2 text-sm text-slate-400">Loading projects...</p>
                          )}

                          {!isLoadingProjects && projectsError && (
                            <p className="px-4 py-2 text-sm text-red-600">{projectsError}</p>
                          )}

                          {!isLoadingProjects && !projectsError && projects.length === 0 && (
                            <p className="px-4 py-2 text-sm text-slate-400">No projects found</p>
                          )}

                          {!isLoadingProjects && !projectsError && projects.map((project) => (
                            <button
                              key={project.projectId}
                              type="button"
                              role="menuitem"
                              onClick={() => handleProjectSelect(project)}
                              className={`w-full px-4 py-3 text-left transition hover:bg-white/10 ${selectedProjectId === project.projectId ? "bg-[#135BEC]/20" : ""
                                }`}
                            >
                              <span className="block truncate text-sm font-medium text-white">
                                {getProjectLabel(project)}
                              </span>
                              <span className="mt-0.5 block text-xs text-slate-400">
                                {project.projectId}
                                {project.status ? ` · ${project.status.replace(/_/g, " ")}` : ""}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              {hasProjects ? (
                <button
                  type="button"
                  onClick={handleStartNewProject}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#135BEC] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#2A6BF0]"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>New Project</span>
                </button>
              ) : null}
            </div>

            {/* Notification */}
            <button className="relative rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition hover:border-blue-400/30 hover:bg-white/10">
              <Bell className="h-5 w-5 text-slate-200" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400" />
            </button>

            {/* Avatar */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-blue-400"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                aria-label="Open profile menu"
              >
                <img src={avatarSrc} alt="User Avatar" className="h-full w-full object-cover" />
              </button>

              {isProfileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-56 rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,32,0.96),rgba(11,23,44,0.94))] shadow-2xl backdrop-blur-xl"
                >
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="text-sm font-semibold text-white">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {displayEmail}
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      role="menuitem"
                      href="/profile-section"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Profile
                    </Link>
                    <Link
                      role="menuitem"
                      href="/order"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                    >
                      <FileText className="h-4 w-4 text-slate-400" />
                      Orders & Invoices
                    </Link>
                  </div>

                  <div className="border-t border-white/10 py-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}
