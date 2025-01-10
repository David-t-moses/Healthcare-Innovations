import { Skeleton } from "./ui/skeleton";

const HeaderSkeleton = () => (
  <header className="bg-gray-100 shadow-md sticky top-0 z-10">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-4 w-full sm:w-auto">
        <Skeleton className="w-6 h-6 rounded-lg" />
        <Skeleton className="h-7 w-40" />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        <div className="flex items-center space-x-2 order-2 sm:order-1">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-64 h-10 rounded-lg hidden md:block" />
        </div>

        <div className="flex items-center justify-end space-x-3 order-1 sm:order-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-32 h-10 rounded-lg" />
        </div>
      </div>
    </div>
  </header>
);

const SidebarSkeleton = () => (
  <div className="hidden fixed inset-y-0 left-0 z-30 w-72 bg-gray-100 xl:flex flex-col">
    {/* Header */}
    <div className="p-6 bg-gray-100 border-b">
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-4 w-56" />
    </div>

    {/* Navigation Items */}
    <nav className="mt-6 px-4 flex-grow">
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} className="px-4 py-3">
            <div className="flex items-center">
              <Skeleton className="w-5 h-5 rounded mr-3" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </nav>

    {/* Logout Button */}
    <div className="p-4 border-t">
      <Skeleton className="w-full h-12 rounded-lg" />
    </div>
  </div>
);

export const DashboardLayoutSkeleton = () => (
  <div className="relative flex w-full">
    <SidebarSkeleton />
    <main className="flex-1 w-full xl:ml-72">
      <HeaderSkeleton />
      <div className="p-4 sm:p-6 w-full">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </main>
  </div>
);
