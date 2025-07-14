import React, { Suspense } from 'react';
const ExplorePage = React.lazy(() => import('./ExplorePage'));

export default function ExplorePageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Explore...</div>}>
      <ExplorePage />
    </Suspense>
  );
}