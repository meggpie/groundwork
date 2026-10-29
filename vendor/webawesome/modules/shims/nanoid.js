const a = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
export function nanoid(size = 21) {
  let id = "";
  const b = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0;i < size; i++)
    id += a[b[i] & 63];
  return id;
}
