import mongoose from "mongoose";

export function mongooseConnect() {
  // MONGODB_URI'nin varlığını kontrol ediyoruz
  const uri = process.env.MONGODB_URI;
  console.log("uri", uri);
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment variables.");
  }

  // Eğer mongoose zaten bağlıysa, bağlantıyı yeniden yapmaya gerek yok
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.asPromise(); // Bağlantı kurulmuşsa aynı bağlantıyı döndürüyoruz
  } else {
    // Bağlantı kurulu değilse bağlantıyı oluşturuyoruz
    return mongoose.connect(uri);
  }
}
