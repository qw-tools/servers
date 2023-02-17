export function SiteFooter() {
  return (
    <div className="container">
      <div className="flex h-10 items-center justify-center text-xs space-x-2">
        <span>
          Created by{" "}
          <a className="text-sky-600" href="https://vikpe.org">
            vikpe
          </a>{" "}
          a.k.a. "XantoM"
        </span>
        <span className="text-gray-400">|</span>
        <a
          className="text-sky-600"
          href="https://github.com/qw-tools/recent-demos"
        >
          Source on GitHub &#8599;
        </a>
      </div>
    </div>
  );
}
