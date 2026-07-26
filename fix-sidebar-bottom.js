const fs = require('fs');

const path = './src/components/layout/sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// Also need useSession for the sidebar profile
if (!content.includes('useSession')) {
  content = content.replace('import { usePathname } from "next/navigation"', 'import { usePathname } from "next/navigation"\nimport { useSession } from "next-auth/react"');
}
if (!content.includes('const { data: session }')) {
  content = content.replace('const pathname = usePathname()', 'const pathname = usePathname()\n  const { data: session } = useSession()');
}

const bottomSection = `      </div>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-surface-200">
        <div className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-50 cursor-pointer transition-colors", isCollapsed ? "md:justify-center px-0" : "")}>
          <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm overflow-hidden">
            {session?.user?.image ? (
              <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
            ) : (
              session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : 'EX'
            )}
          </div>
          <div className={cn("flex-1 min-w-0", isCollapsed && "md:hidden")}>
            <p className="text-[13px] font-semibold text-surface-900 truncate">{session?.user?.name || 'Executive'}</p>
            <p className="text-[11px] text-surface-400 truncate">{session?.user?.email || 'admin@foundation.org'}</p>
          </div>
          <span className={cn("material-symbols-outlined text-surface-400 shrink-0", isCollapsed && "md:hidden")} style={{fontSize:'16px'}}>settings</span>
        </div>
      </div>

      </aside>`;

content = content.replace('      </div>\n      </aside>', bottomSection);
fs.writeFileSync(path, content);
