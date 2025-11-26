declare module 'fabric' {
  export namespace fabric {
    class Canvas {
      constructor(element: HTMLCanvasElement | null, options?: any): Canvas
      add(...objects: any[]): Canvas
      remove(...objects: any[]): Canvas
      getObjects(): any[]
      getPointer(e: any): any
      on(eventName: string, handler: (e: any) => void): void
      renderAll(): void
      setWidth(width: number): void
      setHeight(height: number): void
      dispose(): void
      [key: string]: any
    }

    class Object {
      left?: number
      top?: number
      width?: number
      height?: number
      selectable?: boolean
      [key: string]: any
    }

    interface IEvent {
      e: any
      selected?: any[]
      [key: string]: any
    }

    namespace Image {
      function fromURL(url: string, callback: (img: any) => void): void
    }

    class Rect {
      constructor(options?: any): Rect
      [key: string]: any
    }

    class Line {
      constructor(points: number[], options?: any): Line
      [key: string]: any
    }

    class Circle {
      constructor(options?: any): Circle
      [key: string]: any
    }

    class Triangle {
      constructor(options?: any): Triangle
      [key: string]: any
    }

    class Textbox {
      constructor(text: string, options?: any): Textbox
      [key: string]: any
    }

    class Group {
      constructor(objects?: any[], options?: any): Group
      [key: string]: any
    }

    class Text {
      constructor(text: string, options?: any): Text
      [key: string]: any
    }
  }
}
