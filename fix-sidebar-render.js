const fs = require('fs');

const path = './src/components/layout/sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// The new render string
const newRender = `  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside 
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 flex flex-col h-full bg-white border-r border-surface-200 transition-all duration-300 ease-in-out w-[80%] max-w-[320px] md:translate-x-0 shrink-0",
          isOpen ? "translate-x-0 animate-slide-left" : "-translate-x-full",
          isCollapsed ? "md:w-[80px]" : "md:w-[260px]"
        )}
      >
        <div className="px-5 pt-5 pb-6 flex items-center justify-between border-b border-transparent">
          <div className={cn("flex items-center gap-3", isCollapsed ? "md:justify-center w-full" : "")}>
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <span className="material-symbols-outlined filled text-white" style={{fontSize:'18px'}}>diamond</span>
            </div>
            <div className={cn(isCollapsed && "md:hidden")}>
              <h1 className="text-[15px] font-bold text-surface-950 tracking-tight leading-tight whitespace-nowrap">Foundation ERP</h1>
              <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-[0.08em]">Enterprise Suite</span>
            </div>
          </div>
          <button 
            className="md:hidden flex items-center justify-center h-11 w-11 -mr-3 text-surface-500 hover:text-surface-900 rounded-md"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

      <div className="flex-1 overflow-auto pb-4">
        <nav className="space-y-0.5 px-3">
          {sidebarSections.map((section, sIdx) => (
            <React.Fragment key={sIdx}>
              <div className={cn("px-3 pt-4 pb-2", isCollapsed && "md:hidden")}>
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.1em]">{section.title}</span>
              </div>
              {section.items.map((item) => {
                const isActive = pathname === item.href

                if (item.submenu) {
                  const isMenuOpen = openItems[item.name]
                  const isChildActive = item.submenu.some(sub => pathname === sub.href)
                  const isSectionActive = isChildActive || isActive

                  return (
                    <Collapsible
                      key={item.name}
                      open={isMenuOpen}
                      onOpenChange={() => toggleItem(item.name)}
                    >
                      <CollapsibleTrigger
                        title={isCollapsed ? item.name : undefined}
                        className={cn(
                          "nav-item flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                          isCollapsed ? "md:justify-center" : "",
                          isSectionActive
                            ? "active"
                            : "text-surface-600 hover:text-surface-900 hover:bg-surface-50"
                        )}
                      >
                        <div className={cn("flex items-center", isCollapsed ? "md:justify-center w-full" : "gap-3")}>
                          <span className={cn("material-symbols-outlined flex-shrink-0", isSectionActive ? "filled text-brand-500" : "text-surface-400")}>
                            {item.iconName}
                          </span>
                          <span className={cn(isCollapsed && "md:hidden")}>{item.name}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 ml-auto text-surface-400 transition-transform duration-200",
                            isMenuOpen ? "rotate-180" : "",
                            isCollapsed && "md:hidden"
                          )}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className={cn("space-y-0.5 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down", isCollapsed && "md:hidden")}>
                        <div className="pt-1 pb-1">
                          {item.submenu.map((sub) => {
                            const isSubActive = pathname === sub.href
                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "flex items-center pl-10 pr-3 py-2 text-[12px] font-medium rounded-lg transition-colors",
                                  isSubActive
                                    ? "bg-brand-50 text-brand-600"
                                    : "text-surface-600 hover:text-surface-900 hover:bg-surface-50"
                                )}
                              >
                                {sub.name}
                              </Link>
                            )
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                      isCollapsed ? "md:justify-center" : "",
                      isActive
                        ? "active"
                        : "text-surface-600 hover:text-surface-900 hover:bg-surface-50"
                    )}
                  >
                    <span className={cn("material-symbols-outlined flex-shrink-0", isActive ? "filled text-brand-500" : "text-surface-400")}>
                      {item.iconName}
                    </span>
                    <span className={cn(isCollapsed && "md:hidden")}>{item.name}</span>
                  </Link>
                )
              })}
            </React.Fragment>
          ))}
        </nav>
      </div>
      </aside>
    </>
  )`;

const startIdx = content.indexOf('return (');
const endIdx = content.lastIndexOf(')') + 1;
if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + newRender + '\n}';
  fs.writeFileSync(path, content);
}
