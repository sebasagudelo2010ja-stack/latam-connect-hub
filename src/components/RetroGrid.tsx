const RetroGrid = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden [perspective:200px]" aria-hidden="true">
      <div className="absolute inset-0 [transform:rotateX(35deg)]">
        <div
          className="animate-retro-grid"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsla(217,91%,60%,0.15) 1px, transparent 0),
              linear-gradient(to bottom, hsla(217,91%,60%,0.15) 1px, transparent 0)
            `,
            backgroundSize: "60px 60px",
            backgroundRepeat: "repeat",
            position: "absolute",
            inset: "-50%",
            width: "200%",
            height: "200%",
            ["--grid-size" as string]: "60px",
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
  );
};

export default RetroGrid;
