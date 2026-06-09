import MapDogMarker from "./MapDogMarker";

function MapCanvas({ animals = [] }) {
  return (
    <section className="map-canvas">
      <div className="map-canvas__overlay">
        <p>Demo field map · Kondapur / Masjid Banda</p>
      </div>

      {animals.slice(0, 12).map((animal, index) => (
        <MapDogMarker key={animal.id} animal={animal} index={index} />
      ))}
    </section>
  );
}

export default MapCanvas;