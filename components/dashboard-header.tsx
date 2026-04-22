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

const getPrimaryProjectService = (project?: UserProject | null) =>
  project?.subServices?.[0] ?? project?.services?.[0]

const resolveStageFromStatus = (status?: string | null) => {
  const normalized = status?.toLowerCase() ?? ""

  if (normalized.includes("final_quotation")) return "final-quotation"
  if (normalized.includes("initial_quotation")) return "initial-quotation"
  if (normalized.includes("consultant")) return "consultant"
  if (normalized.includes("eligibility")) return "eligibility"
  if (normalized.includes("payment")) return "payment"
  if (normalized.includes("upload")) return "upload"
  if (normalized.includes("review")) return "review"

  return null
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
  const { data, updateSection } = useProject()
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
    data.service?.plan ||
    selectedProjectId ||
    null
  const hasProjects = projects.length > 0
  const hasSingleProject = projects.length === 1

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

    if (service?.serviceId || service?.title || service?.serviceName) {
      const resolvedServiceName = resolveProjectServiceName(service, serviceLabelMap)

      updateSection("service", {
        serviceId: service.subServiceId || service.serviceId,
        plan: resolvedServiceName || service.title || service.serviceName,
        category: service.serviceName || resolvedServiceName,
        description: service.description,
        image: service.image,
      })
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

    updateSection("service", {
      serviceId: service.subServiceId || service.serviceId,
      plan: resolvedServiceName || service.title || service.serviceName,
      category: service.serviceName || resolvedServiceName,
      description: service.description,
      image: service.image,
    })
  }, [projects, selectedProjectId, serviceLabelMap])

  const handleProjectSelect = async (project: UserProject) => {
    persistSelectedProject(project)
    setIsProjectOpen(false)

    try {
      const response = await axiosInstance.get<{
        data?: UserProject
      }>(`/projects/${project.projectId}`)

      const detailedProject = extractProjectFromResponse(response.data) ?? project
      persistSelectedProject(detailedProject)

      const stageRoute =
        detailedProject.currentStage?.route ||
        resolveStageFromStatus(detailedProject.status) ||
        "overview"

      router.push(
        stageRoute === "overview"
          ? "/dashboard"
          : `/dashboard?stage=${stageRoute}`
      )
    } catch {
      const fallbackStage = resolveStageFromStatus(project.status) || "overview"
      router.push(
        fallbackStage === "overview"
          ? "/dashboard"
          : `/dashboard?stage=${fallbackStage}`
      )
    }
  }

  const handleStartNewProject = () => {
    updateSection("eligibility", {
      formData: undefined,
      aiFilled: undefined,
      aiDismissed: undefined,
      projectId: undefined,
      isDraft: undefined,
      draftSavedAt: undefined,
      propertyDetails: undefined,
      dimensions: undefined,
      constraints: undefined,
      isEligible: undefined,
      completedAt: undefined,
    })

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
      window.sessionStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
    }

    router.push("/services")
  }

  return (
    <header className="w-full border-b bg-white h-18 sticky top-0 z-50">
      <div className="mx-auto max-w-8xl px-6">
        <div className="flex h-16 items-center justify-between">

          {/* ================= LEFT ================= */}
          <div className="flex items-center gap-6">

            {/* Sidebar Toggle */}
            <button
              onClick={onToggle}
              className="p-2 rounded-md hover:bg-slate-100"
              aria-label="Toggle Sidebar"
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>

            {breadcrumbTrail.length > 0 ? (
              <nav className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
                {breadcrumbTrail.map((crumb, index) => (
                  <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                    {index > 0 ? <span>/</span> : null}
                    {crumb.href ? (
                      <Link href={crumb.href} className="transition hover:text-blue-600">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-900">{crumb.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            ) : null}
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex items-center gap-6">
            {/* Project Selector */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={projectRef}>
                {!hasProjects ? (
                  <button
                    type="button"
                    onClick={handleStartNewProject}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Folder className="h-4 w-4 shrink-0" />
                    <span>New Project</span>
                  </button>
                ) : hasSingleProject ? (
                  <div className="flex max-w-[320px] items-center gap-2 rounded-xl border px-4 py-2 text-sm text-slate-700 bg-slate-50">
                    <Folder className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="truncate">
                      Project: {selectedProjectLabel || projects[0]?.projectId}
                    </span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsProjectOpen((prev) => !prev)}
                      className="flex max-w-70 items-center gap-2 rounded-xl border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
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
                        className="absolute right-0 mt-3 w-80 rounded-xl border border-slate-200 bg-white shadow-lg"
                      >
                        <div className="border-b border-slate-100 px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900">Projects</p>
                          <p className="text-xs text-slate-500">
                            Select a project to continue
                          </p>
                        </div>

                        <div className="max-h-80 overflow-y-auto py-2">
                          {isLoadingProjects && (
                            <p className="px-4 py-2 text-sm text-slate-500">Loading projects...</p>
                          )}

                          {!isLoadingProjects && projectsError && (
                            <p className="px-4 py-2 text-sm text-red-600">{projectsError}</p>
                          )}

                          {!isLoadingProjects && !projectsError && projects.length === 0 && (
                            <p className="px-4 py-2 text-sm text-slate-500">No projects found</p>
                          )}

                          {!isLoadingProjects && !projectsError && projects.map((project) => (
                            <button
                              key={project.projectId}
                              type="button"
                              role="menuitem"
                              onClick={() => handleProjectSelect(project)}
                              className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${selectedProjectId === project.projectId ? "bg-blue-50" : ""
                                }`}
                            >
                              <span className="block truncate text-sm font-medium text-slate-900">
                                {getProjectLabel(project)}
                              </span>
                              <span className="mt-0.5 block text-xs text-slate-500">
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
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>New Project</span>
                </button>
              ) : null}
            </div>

            {/* Notification */}
            <button className="relative rounded-xl border p-2 hover:bg-slate-50">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-600" />
            </button>

            {/* Avatar */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-blue-600"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                aria-label="Open profile menu"
              >
                <img src={avatarSrc} alt="User Avatar" className="h-full w-full object-cover" />
              </button>

              {isProfileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-56 rounded-xl border border-slate-200 bg-white shadow-lg"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {displayEmail}
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      role="menuitem"
                      href="/profile-section"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="h-4 w-4 text-slate-500" />
                      Profile
                    </Link>
                    <Link
                      role="menuitem"
                      href="/order"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <FileText className="h-4 w-4 text-slate-500" />
                      Orders & Invoices
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 py-2">
                    <Link
                      role="menuitem"
                      href="/"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      Logout
                    </Link>
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
