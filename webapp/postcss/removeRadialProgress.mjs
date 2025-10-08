import postcss from "postcss";

export default function removeRadialProgressAtRule() {
  return {
    postcssPlugin: "remove-radialprogress-atrule",
    Once(root) {
      const existingDeclarations = new Set();
      root.walkRules((rule) => {
        if (rule.selector === ":root") {
          rule.walkDecls((decl) => {
            existingDeclarations.add(decl.prop);
          });
        }
      });

      const fallbackDecls = [];

      root.walkAtRules("property", (atRule) => {
        const name = atRule.params?.trim();
        if (!name || !name.startsWith("--")) {
          return;
        }

        let initialValue = null;
        atRule.walkDecls((decl) => {
          if (decl.prop === "initial-value") {
            initialValue = decl.value;
          }
        });

        if (initialValue !== null && !existingDeclarations.has(name)) {
          fallbackDecls.push({ name, initialValue });
          existingDeclarations.add(name);
        }

        atRule.remove();
      });

      if (fallbackDecls.length > 0) {
        let rootRule = null;
        root.walkRules((rule) => {
          if (rule.selector === ":root") {
            rootRule = rule;
          }
        });

        if (!rootRule) {
          rootRule = postcss.rule({ selector: ":root" });
          root.prepend(rootRule);
        }

        fallbackDecls.forEach(({ name, initialValue }) => {
          rootRule.append(postcss.decl({ prop: name, value: initialValue }));
        });
      }
    },
  };
}

removeRadialProgressAtRule.postcss = true;
