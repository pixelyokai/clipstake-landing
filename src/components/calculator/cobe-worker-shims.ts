// The bits of DOM that COBE touches, for running it in a worker on an
// OffscreenCanvas. COBE wraps its canvas in a div and adds a <style> for
// marker anchors (both unused here: our markers have no ids), and loads its
// world map with `new Image()`. The divs become inert stand-ins, and the
// image is fetched as an ImageBitmap that texImage2D is handed instead.
// Imported before "cobe" so these exist when it evaluates.

type Inert = {
  style: Record<string, string>;
  append(): void;
  insertBefore(): void;
  remove(): void;
};
const inert = (): Inert => ({
  style: {},
  append() {},
  insertBefore() {},
  remove() {},
});

class ImageShim {
  onload: (() => void) | null = null;
  bitmap: ImageBitmap | null = null;
  set src(url: string) {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => createImageBitmap(blob))
      .then((bitmap) => {
        this.bitmap = bitmap;
        this.onload?.();
      });
  }
}

const scope = self as unknown as Record<string, unknown>;
if (!("document" in scope)) {
  scope.document = { createElement: inert, head: inert() };
  scope.Image = ImageShim;

  for (const proto of [
    WebGL2RenderingContext.prototype,
    WebGLRenderingContext.prototype,
  ]) {
    const texImage2D = proto.texImage2D as (...args: unknown[]) => void;
    proto.texImage2D = function (
      this: WebGLRenderingContext,
      ...args: unknown[]
    ) {
      const last = args.length - 1;
      if (args[last] instanceof ImageShim)
        args[last] = (args[last] as ImageShim).bitmap;
      return texImage2D.apply(this, args);
    } as typeof proto.texImage2D;
  }
}

export {};
