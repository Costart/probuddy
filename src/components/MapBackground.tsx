import { getMapTileGrid } from "@/lib/geo";

interface MapBackgroundProps {
  lat: string;
  lon: string;
}

export function MapBackground({ lat, lon }: MapBackgroundProps) {
  const { tiles, cols, offsetX, offsetY } = getMapTileGrid(
    parseFloat(lat),
    parseFloat(lon),
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 256px)`,
          gridAutoRows: "256px",
        }}
      >
        {tiles.map((url, i) => (
          <img
            key={i}
            src={url}
            alt=""
            className="block w-[256px] h-[256px]"
            loading="lazy"
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
}
