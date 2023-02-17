import { pages } from "./config";
import classNames from "classnames";

export function SiteHeader(props) {
  return (
    <div className="bg-gray-800">
      <div className="h-12 items-center text-white text-sm">
        <div className="flex items-center h-12">
          <a
            href="https://tools.quake.world/"
            className="px-2 hover:text-yellow-200"
          >
            QuakeWorld Tools
          </a>
          <div className="text-gray-400 mr-6 font-mono">Servers</div>
          {pages.map((page, pageIndex) => (
            <a
              key={page.url}
              href={page.url}
              className={
                classNames(
                  "flex px-2 h-full items-center hover:text-yellow-100",
                  {
                    "font-bold text-green-300": props.selectedPageIndex === pageIndex,
                    "text-sky-200": props.selectedPageIndex !== pageIndex
                  }
                )
              }
            >
              {page.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
