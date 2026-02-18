import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getSearchResults,
  getCoverageSummary,
} from "@/lib/db/queries/search-results";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata = { title: "Pro Coverage | Dashboard" };

export default async function CoveragePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [results, summary] = await Promise.all([
    getSearchResults(500),
    getCoverageSummary(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-on-surface">
          Pro Coverage
        </h1>
        <p className="mt-1 text-on-surface-variant">
          {results.length} zip/category combinations tracked
        </p>
      </div>

      {/* Summary by category */}
      {summary.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b border-outline-variant/50">
              <h2 className="font-display font-bold text-on-surface">
                Summary by Category
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/50 text-left text-on-surface-variant">
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Thumbtack Category</th>
                    <th className="p-4 font-medium">Zips Searched</th>
                    <th className="p-4 font-medium">Zips with Pros</th>
                    <th className="p-4 font-medium">Avg Pros</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((row) => (
                    <tr
                      key={row.categorySlug || "unknown"}
                      className="border-b border-outline-variant/30 hover:bg-surface-container/50"
                    >
                      <td className="p-4 font-medium text-on-surface">
                        {row.categorySlug || "—"}
                      </td>
                      <td className="p-4 text-on-surface-variant">
                        {row.thumbtackCategory || "—"}
                      </td>
                      <td className="p-4 text-on-surface-variant">
                        {row.totalZips}
                      </td>
                      <td className="p-4">
                        <span
                          className={
                            row.zipsWithResults > 0
                              ? "text-green-600 font-medium"
                              : "text-outline"
                          }
                        >
                          {row.zipsWithResults}
                        </span>
                      </td>
                      <td className="p-4 text-on-surface-variant">
                        {row.avgResultCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full results table */}
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b border-outline-variant/50">
            <h2 className="font-display font-bold text-on-surface">
              All Search Results
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/50 text-left text-on-surface-variant">
                  <th className="p-4 font-medium">Zip Code</th>
                  <th className="p-4 font-medium">Location</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Thumbtack Category</th>
                  <th className="p-4 font-medium">TT Category ID</th>
                  <th className="p-4 font-medium">Pros Found</th>
                  <th className="p-4 font-medium">Last Searched</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-outline-variant/30 hover:bg-surface-container/50"
                  >
                    <td className="p-4 font-medium text-on-surface font-mono">
                      {row.zipCode}
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {row.requestLocation || "—"}
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {row.categorySlug || "—"}
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {row.thumbtackCategory || "—"}
                    </td>
                    <td className="p-4 text-on-surface-variant font-mono text-xs">
                      {row.thumbtackCategoryId || "—"}
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          row.resultCount > 0
                            ? "text-green-600 font-bold"
                            : "text-error font-medium"
                        }
                      >
                        {row.resultCount}
                      </span>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {new Date(row.searchedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-on-surface-variant"
                    >
                      No search data yet. Results are logged automatically when
                      users search for pros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
