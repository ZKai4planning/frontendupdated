export interface Feature {
  title: string;
  header?: string;
  description?: string;
  subServiceId?: string;
  status?: boolean;
}

export interface Service {
  id: string;
  title: string;
  shortTitle: string;
  image: string;
  subtitle: string;
  description: string;
  features: Feature[];
  feature1?: string;
  cta: string;
  label: string;
  status?: boolean;
}

// API Response Types
export interface ApiSubService {
  serviceId: string;
  subServiceId: string;
  title: string;
  description: string;
  images: string[];
  status: boolean;
}

export interface ApiServiceData {
  image: string;
  serviceId: string;
  title: string;
  description: string;
  images: string[];
  status: boolean;
  subServices: ApiSubService[];
  serviceName?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: ApiServiceData[];
}
