export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | boolean | undefined> = {},
  ...children: Array<Node | string | null | undefined>
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value === undefined) continue;
    if (value === true) node.setAttribute(key, "");
    else if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    if (child == null) continue;
    node.append(child);
  }
  return node;
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): HTMLElement {
  const wrap = document.createElement("div");
  wrap.innerHTML = strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "").trim();
  return wrap.firstElementChild as HTMLElement;
}

export function clear(node: HTMLElement): void {
  node.replaceChildren();
}
