---
draft: 'true'
---
# 🧠 Complex Markdown Code Example

This doc demonstrates `inline code`, fenced blocks, syntax highlighting, code inside lists, blockquotes, and nested content.

## 💡 Inline & Block

Use `npm run build` to generate the static files.

```sh
# Install dependencies
npm install

# Build the site
npm run build
```

## 📦 JSON Config

```json
{
  "title": "Example",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 🧱 Inside Admonition

:::note YAML inside a note
```yaml
site:
  name: MySite
  theme: dark
  plugins:
    - search
    - analytics
```
:::

## 📋 Lists with Code

- Install with `yarn`
- Build with `npm run build`
- Run a local server:
  ```bash
  npx serve dist
  ```

## 🧩 Mixed Content

> ❗ Run `./deploy.sh` only from the `main` branch.
>
> ```bash
> ./deploy.sh --prod
> ```

## 🔗 Code inside Table

| Command | Description         |
|---------|---------------------|
| `ls`    | List files          |
| `rm`    | Delete a file       |
| `curl`  | Make HTTP requests  |

## 🧪 Button-style (via HTML)

Use raw HTML for buttons:

```html
<button onclick="alert('Hello!')">Click Me</button>
```

## 🧬 Complex Function

```ts
function debounce<F extends (...args: any[]) => void>(fn: F, delay = 300): F {
  let timeout: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  } as F;
}
```


Demonstrates every admonition, `<details>`, inline HTML, code blocks, and embedded buttons.

---

## 📌 All Admonitions with Buttons and Code

:::note Info Note
Helpful message here. Here's `inline code`.

```js
console.log("Note block");
```

<button onclick="alert('Note Button Clicked')">Note Button</button>
:::

:::tip Pro Tip
Use tips for helpful suggestions!

```bash
echo "Tips are useful"
```

<button onclick="alert('Tip Button')">Tip Button</button>
:::

:::info Information
Extra information provided here.

```json
{ "info": true }
```

<button onclick="alert('Info Button')">Info</button>
:::

:::caution Caution
Something might go wrong!

```python
raise Warning("Caution advised")
```

<button onclick="alert('Caution')">Caution</button>
:::

:::danger Danger Zone
Things can break here. Proceed with care.

```sh
rm -rf /
```

<button onclick="alert('Danger!')">Danger Button</button>
:::

:::warning Warning
Not quite danger, but definitely not safe.

```yaml
warning: true
```

<button onclick="alert('Warning!')">Warning</button>
:::

:::important Pay Attention
Critical information ahead!

```ts
type Important = "Very";
```

<button onclick="alert('Important!')">Important Button</button>
:::

---

## 🔍 Expandable Content

<details>
<summary>Click to expand</summary>

### Inside the details block

```bash
echo "Inside details"
```
:::note

```bash
echo "Inside admonition, inside details"
```
:::

<button onclick="alert('Details Button')">Details Button</button>

</details>

---

## ✅ Confirmed Features

- [x] Admonitions
- [x] Code blocks
- [x] Inline code
- [x] HTML buttons
- [x] `<details>` block

