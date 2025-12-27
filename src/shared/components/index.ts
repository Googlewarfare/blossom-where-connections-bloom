/**
 * Shared UI Components Barrel Export
 * 
 * Re-exports all shadcn/ui primitives and custom UI components
 * for use throughout the application.
 */

// shadcn/ui primitives
export * from "@/components/ui/accordion";
export * from "@/components/ui/alert";
export * from "@/components/ui/alert-dialog";
export * from "@/components/ui/aspect-ratio";
export * from "@/components/ui/avatar";
export * from "@/components/ui/badge";
export * from "@/components/ui/breadcrumb";
export * from "@/components/ui/button";
export * from "@/components/ui/calendar";
export * from "@/components/ui/card";
export * from "@/components/ui/carousel";
export * from "@/components/ui/chart";
export * from "@/components/ui/checkbox";
export * from "@/components/ui/collapsible";
export * from "@/components/ui/command";
export * from "@/components/ui/context-menu";
export * from "@/components/ui/dialog";
export * from "@/components/ui/drawer";
export * from "@/components/ui/dropdown-menu";
export * from "@/components/ui/empty-state";
export * from "@/components/ui/form";
export * from "@/components/ui/hover-card";
export * from "@/components/ui/input";
export * from "@/components/ui/input-otp";
export * from "@/components/ui/label";
export * from "@/components/ui/loading-spinner";
export * from "@/components/ui/menubar";
export * from "@/components/ui/navigation-menu";
export * from "@/components/ui/pagination";
export * from "@/components/ui/popover";
export * from "@/components/ui/progress";
export * from "@/components/ui/radio-group";
export * from "@/components/ui/resizable";
export * from "@/components/ui/scroll-area";
export * from "@/components/ui/select";
export * from "@/components/ui/separator";
export * from "@/components/ui/sheet";
export * from "@/components/ui/sidebar";
export * from "@/components/ui/skeleton";
export * from "@/components/ui/skeleton-card";
export * from "@/components/ui/skip-link";
export * from "@/components/ui/slider";
export { Toaster as Sonner } from "@/components/ui/sonner";
export * from "@/components/ui/switch";
export * from "@/components/ui/table";
export * from "@/components/ui/tabs";
export * from "@/components/ui/textarea";
export * from "@/components/ui/toast";
export { Toaster } from "@/components/ui/toaster";
export * from "@/components/ui/toggle";
export * from "@/components/ui/toggle-group";
export * from "@/components/ui/tooltip";

// Custom shared components
export { default as AppLoader } from "@/components/AppLoader";
export { default as ErrorBoundary } from "@/components/ErrorBoundary";
export { ApiErrorFallback } from "@/components/ApiErrorFallback";
export { NetworkStatusBanner } from "@/components/NetworkStatusBanner";
export { OfflineFallback } from "@/components/OfflineFallback";
export { PageTransition } from "@/components/PageTransition";
export { OptimizedImage } from "@/components/OptimizedImage";
export { PullToRefresh } from "@/components/PullToRefresh";
