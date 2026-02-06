// Israeli cities with coordinates
const israeliCities = [
  { id: "tel-aviv", name: "תל אביב", lat: 32.0853, lng: 34.7818 },
  { id: "jerusalem", name: "ירושלים", lat: 31.7683, lng: 35.2137 },
  { id: "haifa", name: "חיפה", lat: 32.794, lng: 34.9896 },
  { id: "rishon-lezion", name: "ראשון לציון", lat: 31.9642, lng: 34.8047 },
  { id: "petah-tikva", name: "פתח תקווה", lat: 32.0878, lng: 34.8871 },
  { id: "ashdod", name: "אשדוד", lat: 31.8044, lng: 34.6503 },
  { id: "netanya", name: "נתניה", lat: 32.3328, lng: 34.86 },
  { id: "beersheba", name: "באר שבע", lat: 31.2518, lng: 34.7913 },
  { id: "bnei-brak", name: "בני ברק", lat: 32.0809, lng: 34.8338 },
  { id: "holon", name: "חולון", lat: 32.0188, lng: 34.7795 },
  { id: "ramat-gan", name: "רמת גן", lat: 32.0684, lng: 34.8248 },
  { id: "ashkelon", name: "אשקלון", lat: 31.6688, lng: 34.5742 },
  { id: "rehovot", name: "רחובות", lat: 31.8956, lng: 34.8081 },
  { id: "bat-yam", name: "בת ים", lat: 32.0192, lng: 34.7505 },
  { id: "bet-shemesh", name: "בית שמש", lat: 31.7486, lng: 34.9875 },
  { id: "kfar-saba", name: "כפר סבא", lat: 32.1774, lng: 34.9068 },
  { id: "herzliya", name: "הרצליה", lat: 32.1624, lng: 34.8443 },
  { id: "hadera", name: "חדרה", lat: 32.4343, lng: 34.9188 },
  { id: "modiin", name: "מודיעין", lat: 31.8969, lng: 35.0095 },
  { id: "nazareth", name: "נצרת", lat: 32.7046, lng: 35.2978 },
  { id: "lod", name: "לוד", lat: 31.9514, lng: 34.8885 },
  { id: "ramla", name: "רמלה", lat: 31.9296, lng: 34.8623 },
  { id: "nahariya", name: "נהריה", lat: 33.0079, lng: 35.0942 },
  { id: "rosh-haayin", name: "ראש העין", lat: 32.0934, lng: 34.9598 },
  { id: "givatayim", name: "גבעתיים", lat: 32.0695, lng: 34.8118 },
  { id: "karmiel", name: "כרמיאל", lat: 32.9179, lng: 35.2965 },
  { id: "yavne", name: "יבנה", lat: 31.8783, lng: 34.7413 },
  { id: "acre", name: "עכו", lat: 32.9265, lng: 35.0834 },
  { id: "elat", name: "אילת", lat: 29.5577, lng: 34.9519 },
  { id: "raanana", name: "רעננה", lat: 32.1843, lng: 34.8706 },
  { id: "kiryat-ata", name: "קריית אתא", lat: 32.8044, lng: 35.1023 },
  { id: "kiryat-gat", name: "קריית גת", lat: 31.6095, lng: 34.7642 },
  { id: "kiryat-motzkin", name: "קריית מוצקין", lat: 32.8373, lng: 35.0754 },
  { id: "kiryat-yam", name: "קריית ים", lat: 32.8462, lng: 35.0656 },
  { id: "kiryat-bialik", name: "קריית ביאליק", lat: 32.8275, lng: 35.0871 },
  { id: "kiryat-ono", name: "קריית אונו", lat: 32.0586, lng: 34.8552 },
  { id: "or-yehuda", name: "אור יהודה", lat: 32.0286, lng: 34.8585 },
  { id: "ness-ziona", name: "נס ציונה", lat: 31.9303, lng: 34.7992 },
  { id: "zefat", name: "צפת", lat: 32.9658, lng: 35.4983 },
  { id: "tiberias", name: "טבריה", lat: 32.7959, lng: 35.5302 },
  { id: "dimona", name: "דימונה", lat: 31.0689, lng: 35.0332 },
  { id: "tamra", name: "טמרה", lat: 32.8526, lng: 35.1985 },
  { id: "sakhnin", name: "סכנין", lat: 32.865, lng: 35.2969 },
  { id: "yehud", name: "יהוד", lat: 32.0334, lng: 34.8892 },
  { id: "shfaram", name: "שפרעם", lat: 32.8066, lng: 35.1695 },
  { id: "nof-hagalil", name: "נוף הגליל", lat: 32.7029, lng: 35.3236 },
  { id: "umm-al-fahm", name: "אום אל-פחם", lat: 32.5181, lng: 35.1523 },
  { id: "migdal-haemek", name: "מגדל העמק", lat: 32.6744, lng: 35.2359 },
  { id: "afula", name: "עפולה", lat: 32.6078, lng: 35.2897 },
  { id: "beit-shean", name: "בית שאן", lat: 32.4973, lng: 35.4992 },
];
export default israeliCities;

// Helper function to search cities by name
export function searchCities(query: string): typeof israeliCities {
  if (!query || query.trim() === "") {
    return israeliCities;
  }

  const normalizedQuery = query.toLowerCase().trim();
  return israeliCities.filter((city) => city.name.includes(normalizedQuery));
}

// Helper function to get city by ID
export function getCityById(id: string) {
  return israeliCities.find((city) => city.id === id);
}

// Helper function to get city by name
export function getCityByName(name: string) {
  return israeliCities.find((city) => city.name === name);
}
