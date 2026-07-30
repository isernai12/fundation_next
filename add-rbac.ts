import { Project, SyntaxKind, FunctionDeclaration, VariableDeclaration } from "ts-morph";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

project.addSourceFilesAtPaths("src/features/*/actions.ts");

const moduleMap: Record<string, string> = {
  contributions: "Fund Collection",
  settings: "Settings",
  profile: "Users",
  campaigns: "Fund Collection",
  grants: "Grants",
  donors: "Donors",
  members: "Members",
  dashboard: "Dashboard",
  beneficiaries: "Beneficiaries",
  loans: "Loans",
  groups: "Groups",
  ledger: "Reports",
  "audit-logs": "Settings",
  reports: "Reports",
  documents: "Settings",
};

function getAction(name: string): string {
  if (name.startsWith("get") || name.startsWith("fetch") || name.startsWith("load")) return "View";
  if (name.startsWith("create") || name.startsWith("add")) return "Add";
  if (name.startsWith("update") || name.startsWith("edit")) return "Edit";
  if (name.startsWith("delete") || name.startsWith("remove")) return "Delete";
  if (name.startsWith("approve")) return "Approve";
  if (name.startsWith("receive")) return "Receive Installment";
  return "Manage";
}

const files = project.getSourceFiles();

for (const file of files) {
  const filePath = file.getFilePath();
  if (!filePath.includes("/features/")) continue;
  
  const featureName = filePath.split("/features/")[1].split("/")[0];
  const moduleName = moduleMap[featureName] || "Settings";

  let rbacImport = file.getImportDeclaration(d => d.getModuleSpecifierValue() === "@/lib/rbac");
  if (!rbacImport) {
    file.addImportDeclaration({
      namedImports: ["requirePermission"],
      moduleSpecifier: "@/lib/rbac"
    });
  } else {
    const hasRequirePermission = rbacImport.getNamedImports().some(n => n.getName() === "requirePermission");
    if (!hasRequirePermission) {
      rbacImport.addNamedImport("requirePermission");
    }
  }

  // Handle export async function ...
  const functions = file.getFunctions().filter(f => f.isExported() && f.isAsync());
  for (const func of functions) {
    const name = func.getName();
    if (!name) continue;
    const action = getAction(name);
    
    // Check if it already has requirePermission
    const body = func.getBodyText();
    if (body && !body.includes("requirePermission")) {
      func.insertStatements(0, `await requirePermission("${moduleName}", "${action}");`);
    }
  }

  // Handle export const foo = async () => ...
  const variableDeclarations = file.getVariableDeclarations().filter(v => 
    v.hasExportKeyword() && 
    v.getInitializerIfKind(SyntaxKind.ArrowFunction)?.isAsync()
  );
  
  for (const varDecl of variableDeclarations) {
    const name = varDecl.getName();
    const action = getAction(name);
    const arrowFunc = varDecl.getInitializerIfKind(SyntaxKind.ArrowFunction);
    
    if (arrowFunc) {
      const bodyNode = arrowFunc.getBody();
      if (bodyNode.getKind() === SyntaxKind.Block) {
        const bodyText = arrowFunc.getBodyText();
        if (bodyText && !bodyText.includes("requirePermission")) {
          arrowFunc.insertStatements(0, `await requirePermission("${moduleName}", "${action}");`);
        }
      }
    }
  }
  
  console.log(`Processed ${filePath}`);
}

project.saveSync();
console.log("Done!");
