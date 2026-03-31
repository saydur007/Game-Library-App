// Maps numeric ISO 3166-1 country codes (used by IGDB) to alpha-2, display name, and centroid lat/lng
const ISO_COUNTRY_MAP = {
  36:  { alpha2: 'AU', name: 'Australia',     lat: -25.3,  lng: 133.8  },
  40:  { alpha2: 'AT', name: 'Austria',        lat: 47.5,   lng: 14.5   },
  56:  { alpha2: 'BE', name: 'Belgium',        lat: 50.5,   lng: 4.5    },
  76:  { alpha2: 'BR', name: 'Brazil',         lat: -14.2,  lng: -51.9  },
  124: { alpha2: 'CA', name: 'Canada',         lat: 56.1,   lng: -106.3 },
  152: { alpha2: 'CL', name: 'Chile',          lat: -35.7,  lng: -71.5  },
  156: { alpha2: 'CN', name: 'China',          lat: 35.9,   lng: 104.2  },
  191: { alpha2: 'HR', name: 'Croatia',        lat: 45.1,   lng: 15.2   },
  203: { alpha2: 'CZ', name: 'Czech Republic', lat: 49.8,   lng: 15.5   },
  208: { alpha2: 'DK', name: 'Denmark',        lat: 56.3,   lng: 9.5    },
  246: { alpha2: 'FI', name: 'Finland',        lat: 64.0,   lng: 26.0   },
  250: { alpha2: 'FR', name: 'France',         lat: 46.2,   lng: 2.2    },
  276: { alpha2: 'DE', name: 'Germany',        lat: 51.2,   lng: 10.5   },
  300: { alpha2: 'GR', name: 'Greece',         lat: 39.1,   lng: 21.8   },
  348: { alpha2: 'HU', name: 'Hungary',        lat: 47.2,   lng: 19.5   },
  356: { alpha2: 'IN', name: 'India',          lat: 20.6,   lng: 78.9   },
  372: { alpha2: 'IE', name: 'Ireland',        lat: 53.4,   lng: -8.2   },
  376: { alpha2: 'IL', name: 'Israel',         lat: 31.0,   lng: 34.9   },
  380: { alpha2: 'IT', name: 'Italy',          lat: 41.9,   lng: 12.6   },
  392: { alpha2: 'JP', name: 'Japan',          lat: 36.2,   lng: 138.3  },
  410: { alpha2: 'KR', name: 'South Korea',    lat: 35.9,   lng: 127.8  },
  528: { alpha2: 'NL', name: 'Netherlands',    lat: 52.1,   lng: 5.3    },
  554: { alpha2: 'NZ', name: 'New Zealand',    lat: -40.9,  lng: 174.9  },
  578: { alpha2: 'NO', name: 'Norway',         lat: 60.5,   lng: 8.5    },
  616: { alpha2: 'PL', name: 'Poland',         lat: 51.9,   lng: 19.1   },
  620: { alpha2: 'PT', name: 'Portugal',       lat: 39.4,   lng: -8.2   },
  643: { alpha2: 'RU', name: 'Russia',         lat: 61.5,   lng: 105.3  },
  724: { alpha2: 'ES', name: 'Spain',          lat: 40.5,   lng: -3.7   },
  752: { alpha2: 'SE', name: 'Sweden',         lat: 60.1,   lng: 18.6   },
  756: { alpha2: 'CH', name: 'Switzerland',    lat: 46.8,   lng: 8.2    },
  804: { alpha2: 'UA', name: 'Ukraine',        lat: 48.4,   lng: 31.2   },
  826: { alpha2: 'GB', name: 'United Kingdom', lat: 55.4,   lng: -3.4   },
  840: { alpha2: 'US', name: 'United States',  lat: 37.1,   lng: -95.7  },
  858: { alpha2: 'UY', name: 'Uruguay',        lat: -32.5,  lng: -55.8  },
};

function getCountryByNumericCode(code) {
  return ISO_COUNTRY_MAP[Number(code)] || null;
}

module.exports = { ISO_COUNTRY_MAP, getCountryByNumericCode };
