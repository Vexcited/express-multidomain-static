export default function parseFileName (name: string) {
  return name.replace(/[^\w.+=~)(*&]/g, "-");
}