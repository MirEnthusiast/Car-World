class Viewport {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.zoom = 1;
    this.center = new Point(canvas.width / 2, canvas.height / 2);
    this.offset = new Point(0, 0)

    this.drag = {
      start: new Point(0, 0),
      end: new Point(0, 0),
      offset: new Point(0, 0),
      active: false
    };

    this.#addEventListeners();
  }

  reset() {
    this.ctx.restore();
    this.ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    this.ctx.save();
    this.ctx.scale(1 / this.zoom, 1 / this.zoom);
    const offset = this.getOffset();
    this.ctx.translate(offset.x, offset.y);
  }

  getMouse(evt, subtractDragOffset = false) {
    const p = new Point(
      evt.offsetX * this.zoom - this.offset.x,
      evt.offsetY * this.zoom - this.offset.y
    );
    return subtractDragOffset ? subtract(p, this.drag.offset) : p;
  }

  getOffset() {
    return add(this.offset, this.drag.offset);
  }

  #addEventListeners() {
    this.canvas.addEventListener("wheel", this.#handleMouseWheel.bind(this));
    this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
  }

  #handleMouseDown(evt) {
    if (evt.button == 1) { // middle button
      this.drag.start = this.getMouse(evt);
      this.drag.active = true;
    }
  }

  #handleMouseMove(evt) {
    if (this.drag.active) {
      this.drag.end = this.getMouse(evt);
      this.drag.offset = subtract(this.drag.end, this.drag.start);
    }
  }

  #handleMouseUp(evt) {
    if (this.drag.active) {
      this.offset = add(this.offset, this.drag.offset);
      this.drag = {
        start: new Point(0, 0),
        end: new Point(0, 0),
        offset: new Point(0, 0),
        active: false
      };
    }
  }

  #handleMouseWheel(evt) {
    const mouseScreenPos = subtract(this.getMouse(evt), scale(this.offset, -1), this.center);
    const canvasHalf = new Point(this.canvas.width / 2, this.canvas.height / 2);
    const dir = Math.sign(evt.deltaY);
    const oldZoom = this.zoom;
    const step = 0.1;

    this.zoom += dir * step;
    this.zoom = Math.max(1, Math.min(5, this.zoom));
    if (this.zoom == oldZoom) {return};
    this.offset = subtract(this.offset, scale(canvasHalf, step * -dir));
    this.offset = add(this.offset, scale(mouseScreenPos, 0.1 * dir));
    this.center = scale(canvasHalf, this.zoom);
  }
}