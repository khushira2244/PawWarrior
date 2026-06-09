const imageExtensionFixes = {
  "dog_001_kaalu_front.jpg": "dog_001_kaalu_front.jpeg",
  "dog_002_sheru.jpg": "dog_002_sheru.jpeg",
  "dog_003_raja.jpg": "dog_003_raja.jpeg",
  "dog_004_sona.jpg": "dog_004_sona.jpeg",
  "dog_005_bholu.jpg": "dog_005_bholu.jpeg",
  "dog_006_rocky.jpg": "dog_006_rocky.jpeg",
  "dog_007_moti.jpg": "dog_007_moti.jpeg",
  "dog_008_chintu.jpg": "dog_008_chintu.jpeg",
};


export const getDogImagePath = (photoPath) => {
  if (!photoPath) return "/images/dog/Demo_dog.jpg";

  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }

  const fileName = photoPath.split("/").pop();

  const fixes = {
    "Demo_dog.jpeg": "Demo_dog.jpg",
    "demo_dog.jpg": "Demo_dog.jpg",
    "demo_dog.jpeg": "Demo_dog.jpg",
  };

  const fixedFileName = fixes[fileName] || fileName;

  return `/images/dog/${fixedFileName}`;
};