import { Project, SyntaxKind, FunctionDeclaration, VariableDeclaration } from 'ts-morph';
import * as fs from 'fs';

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");
project.addSourceFilesAtPaths("src/**/*.ts");

let totalFilesFixed = 0;
let totalHooksRemoved = 0;

for (const sourceFile of project.getSourceFiles()) {
  const filePath = sourceFile.getFilePath();
  if (filePath.includes("LanguageProvider.tsx")) continue;

  const text = sourceFile.getFullText();
  if (!text.includes("useLanguage")) continue;

  let changed = false;

  // Find all VariableDeclarations like const { t } = useLanguage() or const ... = useLanguage()
  const useLangDecs = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration)
    .filter(v => v.getInitializer()?.getText().includes("useLanguage()"));

  if (useLangDecs.length === 0) continue;

  // We want to keep ONLY the ones that are at the top level of a component/function/hook,
  // and remove any that are inside nested arrow functions, callbacks, useMemo, useEffect, render props, etc.

  useLangDecs.forEach((dec) => {
    if (dec.wasForgotten()) return;
    let node: any = dec.getParent();
    let parentFuncCount = 0;
    let isInsideUseMemoOrCallback = false;

    while (node && node !== sourceFile) {
      const kind = node.getKind();
      if (kind === SyntaxKind.FunctionDeclaration || kind === SyntaxKind.FunctionExpression || kind === SyntaxKind.ArrowFunction) {
        parentFuncCount++;
      }
      if (kind === SyntaxKind.CallExpression) {
        const exprText = node.getExpression().getText();
        if (exprText.includes("useMemo") || exprText.includes("useEffect") || exprText.includes("useCallback") || exprText.includes("map") || exprText.includes("filter") || exprText.includes("forEach")) {
          isInsideUseMemoOrCallback = true;
        }
      }
      node = node.getParent();
    }

    // If it's nested (parentFuncCount > 1 or inside callback/useMemo), REMOVE IT!
    if (parentFuncCount > 1 || isInsideUseMemoOrCallback) {
      const statement = dec.getFirstAncestorByKind(SyntaxKind.VariableStatement);
      if (statement && !statement.wasForgotten()) {
        statement.remove();
        totalHooksRemoved++;
        changed = true;
      }
    }
  });

  if (changed) {
    sourceFile.saveSync();
    totalFilesFixed++;
  }
}

console.log(`Done! Fixed hook violations in ${totalFilesFixed} files. Removed ${totalHooksRemoved} illegal nested hook calls.`);
