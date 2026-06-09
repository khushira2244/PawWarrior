const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://pawwarrior-api-457006001927.asia-south1.run.app";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "API request failed");
  }

  return data;
};

export const getAnimals = async () => {
  return request("/api/animals");
};

export const getNearbyAnimals = async ({ lat, lng, radius = 3000 }) => {
  return request(`/api/animals/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
};

export const getAnimalById = async (animalId) => {
  return request(`/api/animals/${animalId}`);
};

export const getAgentRunsByAnimal = async (animalId) => {
  return request(`/api/agents/runs/animal/${animalId}`);
};

export const runGeminiMission = async (payload) => {
  return request("/api/google-agent/mission", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getCareLogsByAnimal = async (animalId) => {
  return request(`/api/care-logs/${animalId}`);
};

export const getCasesByAnimal = async (animalId) => {
  return request(`/api/cases/animal/${animalId}`);
};

export const getCareFundsByAnimal = async (animalId) => {
  return request(`/api/care-funds/animal/${animalId}`);
};

export const getVetAdviceByAnimal = async (animalId) => {
  return request(`/api/vet-advice/animal/${animalId}`);
};

export const getNearbyVets = async ({ lat, lng, radius = 3000 }) => {
  return request(`/api/vets/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
};

export const uploadAnimalPhoto = async (photoFile) => {
  const formData = new FormData();
  formData.append("photo", photoFile);

  const response = await fetch(`${API_BASE_URL}/api/uploads/animal-photo`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to upload animal photo");
  }

  return data;
};