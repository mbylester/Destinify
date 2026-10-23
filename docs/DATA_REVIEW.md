# Data review

What was checked in `assets/data.js` (675 destinations), how, against what, and what changed. Re-run the automated part any time with `python tools/check_data.py`.

**Honest scope.** Official bodies (DOT, PAGASA) do not publish a per-place budget, best-month or coordinate list for tourist spots. So this review does three things it can do properly, fixes what it found, and says clearly what it could not verify.

| Item | How it was checked | Result | Status |
|---|---|---|---|
| Structure | `tools/check_data.py`: unique names, known provinces, months 1 to 12, budget and days ranges, coordinates inside the Philippines | 0 problems in 675 rows | Verified |
| Coordinates | Every pin compared with the offline GeoNames dataset: nearest town must be in the expected region, and a place named like a town in its own province must be within 12 km of it | 1 real error found and fixed (Port Barton). 0 flags left | Checked against GeoNames and two further sources. This catches pins that are tens of km off or in the wrong region, not a pin a few hundred metres from the best viewpoint |
| Best months | PAGASA's four climate types (Coronas classification), see sources | 32 places in Type II areas used the default November to May, which is the wettest stretch there. Changed to March to June | Corrected. These are climate-based estimates, not per-site official data |
| Budgets | Per-day budget compared with the median for the same type | 20 statistical outliers (mostly 1-day island trips in El Nido and Coron at 7,000 to 8,500) | **Not verifiable from official sources. Still estimates** |

## What changed

**Coordinates.** Port Barton, Palawan moved from 10.417, 119.150 to 10.415, 119.175. The old longitude put the pin about 2.5 km west of the village, in the bay. The new point is within 1 km of both the PhilAtlas barangay point (10.4108, 119.1785) and the Southeast Asia Pilot anchorage position (10°24.975' N, 119°10.370' E). A US NGA GeoNames entry places "Port Barton" about 10 km north-east (10.4756, 119.2472), so sources disagree on the exact point; the pin is now on the bay.

**Best months set to March to June** (the same window the dataset already uses for east-coast beaches), for places in provinces PAGASA classes as Type II (no dry season, wettest November to January or December to February) that had no best months of their own: Catanduanes, Sorsogon, Samar, Northern Samar, Eastern Samar, Southern Leyte, Surigao del Norte, Surigao del Sur and Agusan del Sur. Places that already had their own season (surf swells, whale sharks, waterfalls) were left alone.

- Bulusan Lake (Sorsogon)
- Sogod Bay (Southern Leyte)
- Limasawa (Southern Leyte)
- Sohoton Caves (Samar)
- Biri Islands (Northern Samar)
- Homonhon Island (Eastern Samar)
- Magpupungko Rock Pools (Surigao del Norte)
- Naked Island (Surigao del Norte)
- Sugba Lagoon (Surigao del Norte)
- Bucas Grande (Surigao del Norte)
- Lake Mainit (Surigao del Norte)
- Enchanted River (Surigao del Sur)
- Agusan Marsh (Agusan del Sur)
- Langun-Gobingob Caves (Samar)
- Guiuan Church (Eastern Samar)
- Balangiga Church (Eastern Samar)
- Capul Island (Northern Samar)
- Daku Island (Surigao del Norte)
- Guyam Island (Surigao del Norte)
- Surigao City (Surigao del Norte)
- Mabua Pebble Beach (Surigao del Norte)
- Sorsogon City (Sorsogon)
- Virac (Catanduanes)
- Bato Church (Catanduanes)
- Maasin Cathedral (Southern Leyte)
- Calbayog City (Samar)
- Tandag (Surigao del Sur)
- Del Carmen Mangrove Forest (Surigao del Norte)
- Bislig City (Surigao del Sur)
- Rizal Beach Gubat (Sorsogon)
- Sohoton Cove (Surigao del Norte)
- Tayangban Cave Pool (Surigao del Norte)

## Sources

- PAGASA, *Climate of the Philippines*: https://pagasa.dost.gov.ph/information/climate-philippines (highest rainfall in Baguio, eastern Samar and eastern Surigao; driest in southern Cotabato)
- PIDS, *Weather and climate in the Philippines*, summarising PAGASA's four climate types and where they occur: https://pidswebs.pids.gov.ph/CDN/PUBLICATIONS/pidseid0502.pdf
- Department of Agriculture regional profiles that restate PAGASA's types: Eastern Visayas https://fpa.da.gov.ph/NW/index.php/information-resources/regional-profile/region-viii, Davao https://davao.da.gov.ph/index.php/about-us/regional-profile; DTI Region 8 profile https://dti.gov.ph/regions/region-8/profile
- PAGASA 1991-2020 rainfall and rainy-day normals as reproduced by Suroy.ph (https://suroy.ph/best-time-to-visit-philippines/) and AEDO Construction (https://aedoconstruction.com/blog/best-time-to-build-house-philippines/): Surigao records 661.5 mm in January and 120 mm in May; Borongan (Eastern Samar) has about 25 rainy days in January and 16 in May. These two are secondary reproductions of PAGASA data, not PAGASA's own pages.
- Coordinates: GeoNames (offline via the `reverse_geocoder` package), PhilAtlas https://www.philatlas.com/luzon/mimaropa/palawan/san-vicente/port-barton.html, Southeast Asia Pilot https://southeastasiapilot.com/anchorages/port-barton, US NGA GeoNames.

## Not verified, and what to do next

- **Budgets and fees.** Nothing official covers these. They remain estimates of cost per person for the suggested stay. Best next step: check entrance, environmental, permit and boat fees for the most visited places on the local tourism office or LGU page, and record the date.
- **Type I coastal places that run into June (26 places).** PAGASA Type I areas (western Luzon, Mindoro, Negros Occidental, Palawan) are dry from November to April, so June is the start of the wet season. Some of these use March to June for calm seas, which can be reasonable, but they were not changed: Pagudpud, Bolinao, Potipot Island, Apo Reef, Pandan Island, Balabac, Tubbataha Reefs, Malalison Island, Currimao, Lubang Island, Cuyo Island, Capones Island, Nogas Island, Caluya Islands, Lakawon Island, Blue Lagoon Pagudpud, Patar Beach, Tondol Beach, Saud Beach, Sipaway Island, Mararison Island, Camara Island, Pundaquit Beach, Silanguin Cove, Magalawa Island, Sisiman Cove.
- **Places on climate boundaries.** Climate types do not follow province lines (Leyte, Samar and Davao Oriental are split between types), so Dinagat Islands, Davao Oriental and parts of Quezon, Camarines Sur and Albay were not changed.
- Add `source` and `last reviewed` fields to each destination so every number can be traced.
