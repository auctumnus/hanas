export const exclude =
  <T>(...props: string[]) =>
  (o: T) => {
    for (const prop of props) {
      delete o[prop as keyof T]
    }
    return o
  }
