// Small, soft bubbles rising slowly behind every public page (pure CSS, no JavaScript).
// Fixed values (not Math.random) so server and browser render identical markup.
// [left %, size px, duration s, delay s, colour, drift px]
const BUBBLES: [number, number, number, number, "gold" | "coral" | "magenta" | "violet", number][] = [
  [4, 10, 19, 0, "coral", 30],
  [11, 6, 24, 6, "gold", -20],
  [18, 14, 28, 2, "magenta", 40],
  [26, 8, 21, 11, "violet", -30],
  [33, 5, 17, 4, "gold", 20],
  [41, 12, 26, 14, "coral", -40],
  [48, 7, 22, 8, "magenta", 25],
  [55, 16, 31, 1, "gold", -25],
  [62, 6, 18, 12, "violet", 35],
  [69, 11, 25, 5, "coral", -35],
  [76, 5, 20, 15, "magenta", 20],
  [83, 13, 29, 9, "gold", -20],
  [90, 8, 23, 3, "violet", 30],
  [96, 6, 19, 13, "coral", -15],
];

export function Bubbles() {
  return (
    <div aria-hidden className="bubbles">
      {BUBBLES.map(([left, size, duration, delay, colour, drift], i) => (
        <span
          key={i}
          className={`bubble bubble-${colour}`}
          style={
            {
              left: `${left}%`,
              width: size,
              height: size,
              animationDuration: `${duration}s`,
              animationDelay: `-${delay}s`,
              "--drift": `${drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
