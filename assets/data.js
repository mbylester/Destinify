/* Destinify sample dataset (500 places)
   Format: name|province|group|lat|lng|type|budget PHP|days|activities|popular(1/0)|best months (start-end, optional, default 11-5)
   Groups: L = Luzon & Palawan, V = Visayas, M = Mindanao
   Budgets, best months and coordinates are approximate prototype data. */
const RAW=`Baguio|Benguet|L|16.402|120.596|City|6000|3|ss fd cw ph|1
Sagada|Mountain Province|L|17.084|120.901|Mountain|6200|3|hk cv cm|1|11-4
Banaue Rice Terraces|Ifugao|L|16.927|121.057|Heritage|6500|3|hk cw ph|1
Batad Rice Terraces|Ifugao|L|16.914|121.097|Heritage|6000|3|hk cw ph|0
Kiangan|Ifugao|L|16.783|121.096|Heritage|5500|2|cw hk|0
Buscalan|Kalinga|L|17.383|121.150|Heritage|6000|3|cw hk ph|0|11-4
Vigan|Ilocos Sur|L|17.575|120.387|Heritage|5500|2|cw fd ss bk|1
Paoay Church & Dunes|Ilocos Norte|L|18.059|120.520|Heritage|4500|2|cw ss ad|1
Pagudpud|Ilocos Norte|L|18.558|120.790|Beach|5800|3|sw sf ss|1|3-6
Bangui Windmills|Ilocos Norte|L|18.534|120.759|Nature|4500|2|ph bk ss|1
Kapurpurawan Rock|Ilocos Norte|L|18.526|120.624|Nature|4500|2|ph ss|0
Mt. Pulag|Benguet|L|16.597|120.892|Mountain|5500|2|hk cm ph|1|12-2
Mt. Batulao|Batangas|L|14.050|120.800|Mountain|2000|1|hk cm ph|1|11-4
Mt. Pico de Loro|Cavite|L|14.235|120.620|Mountain|2500|1|hk cm|0|11-4
Hundred Islands|Pangasinan|L|16.200|120.033|Island|3500|2|ih sw kc|1
Bolinao|Pangasinan|L|16.390|119.890|Beach|3500|2|sw ss cv|0|3-6
San Juan, La Union|La Union|L|16.670|120.330|Surf|4000|2|sf fd rl|1|11-4
Anawangin Cove|Zambales|L|15.000|120.078|Beach|3800|2|cm sw hk|0
Nagsasa Cove|Zambales|L|14.930|120.030|Beach|3800|2|cm sw hk|0
Potipot Island|Zambales|L|15.667|119.917|Island|3500|2|sw ih|0|3-6
Subic Bay|Zambales|L|14.821|120.286|Adventure|4000|2|ad wl ss|0
Mt. Pinatubo Crater|Tarlac|L|15.145|120.350|Lake|4500|2|hk ss ph|1|11-4
Bagac|Bataan|L|14.594|120.397|Heritage|4500|2|cw ss|0
Clark Freeport|Pampanga|L|15.180|120.560|City|4000|2|fd ss ad|0
Ditumabo Falls|Aurora|L|15.660|121.600|Waterfall|3500|1|sw hk|0|6-11
Baler|Aurora|L|15.759|121.563|Surf|5500|3|sf sw ss|1|10-2
Callao Cave|Cagayan|L|17.672|121.825|Cave|4500|3|cv kc|0
Anguib Beach|Cagayan|L|18.478|122.220|Beach|6500|3|sw cm|0|3-6
Palaui Island|Cagayan|L|18.500|122.150|Island|6000|3|hk sw ih|0|3-6
Sabtang|Batanes|L|20.330|121.883|Heritage|14000|5|cw ss hk ph|0|3-6
Batan Island|Batanes|L|20.449|121.970|Island|15000|5|ss hk cw ph|1|3-6
Tanay|Rizal|L|14.498|121.355|Waterfall|2500|1|sw hk|1|6-11
Pagsanjan Falls|Laguna|L|14.277|121.454|Waterfall|3000|1|kc sw ad|1|6-11
Nagcarlan Underground Cemetery|Laguna|L|14.130|121.415|Heritage|2500|1|cw|0
Lucban & Tayabas|Quezon|L|14.113|121.556|Heritage|3000|1|cw fd ss|0
Borawan Island|Quezon|L|14.667|121.617|Island|3500|2|sw kc|0|3-6
Taal Heritage Town|Batangas|L|13.883|120.930|Heritage|3000|1|cw ss fd|0
Tagaytay & Taal|Batangas|L|14.115|120.962|Mountain|3500|2|ss hk fd|1
Calatagan|Batangas|L|13.833|120.633|Beach|4500|2|sw dv|0|3-6
Anilao|Batangas|L|13.760|120.910|Diving|6000|2|dv sn|1
Verde Island|Batangas|L|13.530|121.080|Island|4000|2|dv sn|0
Puerto Galera|Oriental Mindoro|L|13.500|120.950|Beach|6500|3|dv sn sw|1
Apo Reef|Occidental Mindoro|L|12.667|120.467|Diving|9000|3|dv sn wl|0|3-6
Pandan Island|Occidental Mindoro|L|12.840|120.750|Island|6000|2|sn dv|0|3-6
Marinduque|Marinduque|L|13.447|121.842|Island|5000|3|cw sw ss|0|3-5
Romblon Island|Romblon|L|12.580|122.270|Island|5000|3|sw ph ss|0|3-6
Sibuyan Island|Romblon|L|12.430|122.600|Nature|6000|3|hk kc cm|0
Calaguas Islands|Camarines Norte|L|14.033|122.933|Beach|6500|3|sw cm|0|3-6
Caramoan|Camarines Sur|L|13.770|123.860|Island|7500|3|ih sn kc|1|3-6
CamSur Watersports|Camarines Sur|L|13.580|123.280|Adventure|4000|2|ad|1
Puraran Beach|Catanduanes|L|13.630|124.430|Surf|6000|3|sf sw|0|8-10
Mayon Volcano|Albay|L|13.257|123.686|Mountain|5000|2|ss hk ph|1
Cagsawa Ruins|Albay|L|13.160|123.700|Heritage|3000|1|ss cw ph|1
Donsol|Sorsogon|L|12.910|123.590|Nature|6000|2|wl sn|1|11-6
Bulusan Lake|Sorsogon|L|12.770|124.050|Lake|3500|2|kc hk|0
Intramuros|Manila|L|14.589|120.975|City|3000|1|cw ss fd bk|1
Binondo|Manila|L|14.601|120.974|City|2500|1|fd cw|1
El Nido|Palawan|L|11.178|119.392|Island|7500|3|ih sn kc|1
Nacpan Beach|Palawan|L|11.290|119.410|Beach|6500|3|sw rl ph|0
Coron|Palawan|L|11.999|120.204|Diving|9800|4|dv sn sw|1
Kayangan Lake|Palawan|L|11.985|120.235|Lake|9000|3|sw ph ss|1
Culion|Palawan|L|11.850|120.020|Heritage|6000|3|cw ss|0
Puerto Princesa|Palawan|L|9.739|118.735|City|4500|2|fd cw ss|1
Honda Bay|Palawan|L|9.800|118.800|Island|4000|1|ih sw sn|1
Underground River|Palawan|L|10.167|118.917|Cave|7000|3|kc cv wl|1
Port Barton|Palawan|L|10.417|119.150|Beach|5500|3|sn ih sw|0
Balabac|Palawan|L|7.980|117.050|Island|12000|5|ih sw sn wl|0|3-6
Tubbataha Reefs|Palawan|L|8.850|119.900|Diving|25000|5|dv wl|0|3-6
Boracay|Aklan|V|11.967|121.925|Beach|9000|4|sw sn ss rl|1
Kalibo|Aklan|V|11.700|122.367|City|4000|2|cw fd|0|1-1
Malalison Island|Antique|V|11.617|122.050|Island|5000|2|sw sn hk|0|3-6
Roxas City|Capiz|V|11.585|122.751|City|3500|2|fd sw|0
Sicogon Island|Iloilo|V|11.490|123.250|Beach|7000|3|sw rl|0|3-6
Concepcion Islands|Iloilo|V|11.217|123.117|Island|5000|2|ih fd|0|3-6
Gigantes Islands|Iloilo|V|11.600|123.350|Island|6500|3|ih sw fd|0|3-6
Iloilo City|Iloilo|V|10.720|122.562|City|5000|2|fd cw ss|0
Miagao Church|Iloilo|V|10.646|122.238|Heritage|3500|1|cw ss|1
Guimaras|Guimaras|V|10.590|122.630|Island|4000|2|fd sw|0
Bacolod|Negros Occidental|V|10.677|122.956|City|4500|2|fd cw|1
Mambukal|Negros Occidental|V|10.550|123.050|Nature|3000|1|hk sw|0
Canlaon Volcano|Negros Occidental|V|10.411|123.132|Mountain|5000|2|hk ph|0
Danjugan Island|Negros Occidental|V|9.865|122.421|Island|5500|2|sn wl sw|0
Sipalay|Negros Occidental|V|9.750|122.400|Beach|5500|3|sw sn|0
Dumaguete|Negros Oriental|V|9.307|123.306|City|4500|2|fd rl bk|1
Casaroro Falls|Negros Oriental|V|9.250|123.220|Waterfall|3000|1|hk sw|0|6-11
Apo Island|Negros Oriental|V|9.072|123.270|Diving|6000|3|dv sn wl|0
Siquijor|Siquijor|V|9.200|123.500|Island|6000|3|sw ss cw|0
Cebu City|Cebu|V|10.293|123.902|Heritage|4000|2|cw fd ss|1
Mactan|Cebu|V|10.310|123.980|Beach|7000|2|dv sw rl|1
Osmeña Peak|Cebu|V|9.793|123.504|Mountain|3500|1|hk ph|1
Moalboal|Cebu|V|9.950|123.396|Diving|6500|3|dv sn|1
Kawasan Falls|Cebu|V|9.803|123.373|Waterfall|5500|2|cy sw hk|1
Oslob|Cebu|V|9.460|123.380|Nature|5500|2|wl sn sw|1
Malapascua|Cebu|V|11.330|124.110|Diving|7500|3|dv sn|1
Bantayan Island|Cebu|V|11.200|123.717|Beach|5500|3|sw ih fd|0
Camotes Islands|Cebu|V|10.650|124.300|Island|5000|3|sw cv|0
Chocolate Hills|Bohol|V|9.829|124.139|Nature|4500|2|ss hk bk|1
Tarsier Sanctuary|Bohol|V|9.690|123.950|Nature|4500|2|wl ss|1
Panglao|Bohol|V|9.550|123.750|Beach|7000|3|dv sw ih|1
Balicasag Island|Bohol|V|9.517|123.683|Diving|6000|1|dv sn|1
Anda|Bohol|V|9.740|124.570|Beach|5500|3|sw rl|0
Danao Adventure Park|Bohol|V|9.900|124.200|Adventure|4500|1|ad cy|0
Kalanggaman Island|Leyte|V|11.100|124.370|Island|4500|2|sw sn|0|3-6
Tacloban|Leyte|V|11.245|125.004|Heritage|4000|2|cw ss|0
Sogod Bay|Southern Leyte|V|10.380|124.980|Diving|6500|3|dv wl|0
Limasawa|Southern Leyte|V|9.933|125.067|Island|4500|2|sw cw|0
Sohoton Caves|Samar|V|11.280|125.070|Cave|5500|2|kc cv|0
Blanca Aurora Falls|Samar|V|12.077|124.725|Waterfall|4500|2|sw hk|0|6-11
Biri Islands|Northern Samar|V|12.680|124.380|Nature|7000|3|ss sw ph|0
Homonhon Island|Eastern Samar|V|10.720|125.730|Island|5500|2|cw sw|0
Calicoan Island|Eastern Samar|V|11.030|125.720|Surf|6500|3|sf sw|0|9-11
Sambawan Island|Biliran|V|11.687|124.567|Island|5000|2|sw sn|0|3-6
General Luna, Siargao|Surigao del Norte|M|9.790|126.160|Surf|8900|4|sf ih sw|1|8-11
Magpupungko Rock Pools|Surigao del Norte|M|9.780|126.150|Nature|5500|2|sw ph|1
Naked Island|Surigao del Norte|M|9.720|126.100|Island|5000|1|sw ph|1
Sugba Lagoon|Surigao del Norte|M|9.890|126.030|Nature|6000|2|kc sw|0
Bucas Grande|Surigao del Norte|M|9.680|125.980|Island|6500|3|kc sw cv|0
Dinagat Islands|Dinagat Islands|M|10.130|125.600|Island|6000|3|sw hk|0
Lake Mainit|Surigao del Norte|M|9.450|125.520|Lake|4500|2|kc ss|0
Britania Islands|Surigao del Sur|M|8.950|126.050|Island|5500|2|ih sw|0|3-6
Tinuy-an Falls|Surigao del Sur|M|8.167|126.283|Waterfall|4800|2|sw ss|0|6-11
Enchanted River|Surigao del Sur|M|8.370|126.340|Nature|5500|2|sw sn|0
Agusan Marsh|Agusan del Sur|M|8.430|125.900|Nature|5500|3|kc wl|0
Camiguin|Camiguin|M|9.170|124.720|Island|6000|3|sw hk ss|1
White Island|Camiguin|M|9.230|124.750|Island|5000|1|sw ph|1
Katibawasan Falls|Camiguin|M|9.185|124.730|Waterfall|3000|1|sw|0|6-11
Cagayan de Oro|Misamis Oriental|M|8.454|124.632|Adventure|4500|2|kc ad fd|1
Ozamiz Cotta Fort|Misamis Occidental|M|8.150|123.840|Heritage|3000|1|cw ss|0
Maria Cristina Falls|Lanao del Norte|M|8.183|124.243|Waterfall|3500|1|ss ph|1|6-11
Tinago Falls|Lanao del Norte|M|8.190|124.190|Waterfall|3000|1|sw ph|1|6-11
Dahilayan|Bukidnon|M|8.200|124.850|Adventure|5000|2|ad hk cm|0
Mt. Kitanglad|Bukidnon|M|8.150|124.900|Mountain|5000|3|hk cm|0
Zamboanga City|Zamboanga del Sur|M|6.900|122.070|Heritage|3500|2|cw ss fd|1
Great Santa Cruz Island|Zamboanga del Sur|M|6.880|122.050|Beach|4500|2|sw ss|0
Dapitan|Zamboanga del Norte|M|8.650|123.420|Heritage|4000|2|cw ss|0
Dipolog|Zamboanga del Norte|M|8.587|123.340|City|3500|1|fd ss|0
Dakak Beach|Zamboanga del Norte|M|8.660|123.460|Beach|6000|2|sw dv|0
Bongao|Tawi-Tawi|M|5.030|119.770|Mountain|12000|4|hk cw|0
Davao City|Davao del Sur|M|7.073|125.613|City|4500|2|fd ss|1
Eden Nature Park|Davao del Sur|M|7.220|125.370|Nature|3000|1|hk ph rl|1
Philippine Eagle Center|Davao del Sur|M|7.180|125.420|Nature|3000|1|wl ss|0
Mt. Apo|Davao del Sur|M|6.987|125.270|Mountain|6000|3|hk cm|1
Samal Island|Davao del Norte|M|7.080|125.730|Island|5000|2|sw ih|1
Dahican Beach|Davao Oriental|M|6.940|126.270|Beach|5500|3|sw sf wl|0
Mt. Hamiguitan|Davao Oriental|M|6.730|126.100|Mountain|5500|3|hk cm wl|0
Aliwagwag Falls|Davao Oriental|M|7.760|126.440|Waterfall|4500|2|sw ss|0|6-11
General Santos|South Cotabato|M|6.116|125.172|City|4500|2|fd ss|1
Lake Sebu|South Cotabato|M|6.210|124.700|Lake|5500|3|ss cw kc|0
Mt. Matutum|South Cotabato|M|6.360|125.070|Mountain|4500|2|hk cm|0
Gumasa Beach|Sarangani|M|5.780|125.230|Beach|4500|3|sw sf|0
Mt. Ulap|Benguet|L|16.283|120.667|Mountain|2500|1|hk ph cm|0
Bontoc|Mountain Province|L|17.090|120.977|Heritage|5000|2|cw ss|0
Maligcong Rice Terraces|Mountain Province|L|17.040|120.970|Heritage|5000|2|hk ph cw|0
Kabayan Mummy Caves|Benguet|L|16.622|120.832|Heritage|4500|2|cw hk|0
Chico River|Kalinga|L|17.410|121.440|Adventure|5000|2|ad kc|0|11-4
Laoag City|Ilocos Norte|L|18.197|120.594|City|4000|2|fd cw ss|0
Pinsal Falls|Ilocos Sur|L|17.150|120.470|Waterfall|3500|1|sw hk|0|6-11
Santa Maria Church|Ilocos Sur|L|17.363|120.483|Heritage|3500|1|cw ss ph|0
Bantay Church|Ilocos Sur|L|17.583|120.383|Heritage|3000|1|cw ss ph|0
Cape Bojeador Lighthouse|Ilocos Norte|L|18.508|120.592|Heritage|4000|1|ss ph|0
Currimao|Ilocos Norte|L|18.017|120.483|Beach|4000|2|sw rl|0|3-6
Tangadan Falls|La Union|L|16.730|120.400|Waterfall|3000|1|sw hk|0|6-11
Agoo Basilica|La Union|L|16.317|120.367|Heritage|3000|1|cw ss|0
Manaoag Church|Pangasinan|L|16.043|120.488|Heritage|3000|1|cw ss|1
Dagupan|Pangasinan|L|16.043|120.334|City|3000|1|fd ss|0
La Trinidad|Benguet|L|16.461|120.590|Nature|3500|1|fd ph ss|1
Mayoyao Rice Terraces|Ifugao|L|16.983|121.233|Heritage|6000|3|hk cw ph|0
Mt. Arayat|Pampanga|L|15.200|120.740|Mountain|2000|1|hk ph|0
Candaba Swamp|Pampanga|L|14.970|120.850|Nature|2500|1|wl ph|0|11-3
Madlum Cave|Bulacan|L|15.100|121.100|Cave|2500|1|cv hk|0
Biak-na-Bato|Bulacan|L|15.140|121.040|Heritage|2500|1|cw hk cv|0
Barasoain Church|Bulacan|L|14.843|120.810|Heritage|2500|1|cw ss|0
Mt. Samat|Bataan|L|14.583|120.467|Heritage|3000|1|cw ss ph|0
Mt. Natib|Bataan|L|14.700|120.400|Mountain|3000|2|hk cm|0
Pawikan Conservation Center|Bataan|L|14.683|120.270|Nature|2500|1|wl ph|0|11-3
Corregidor Island|Cavite|L|14.383|120.567|Heritage|3500|1|cw ss ph|1
Aguinaldo Shrine|Cavite|L|14.438|120.900|Heritage|2500|1|cw ss|0
Mt. Maculot|Batangas|L|13.903|121.020|Mountain|2000|1|hk ph|0
Mt. Talamitam|Batangas|L|14.070|120.770|Mountain|2000|1|hk ph|0
Mt. Gulugod Baboy|Batangas|L|13.730|120.910|Mountain|2000|1|hk ph|0
Fortune Island|Batangas|L|14.013|120.600|Island|3500|1|sw ph ss|0|3-6
Laiya|Batangas|L|13.655|121.405|Beach|5000|2|sw rl ss|1
Malabrigo Lighthouse|Batangas|L|13.614|121.183|Heritage|3500|1|ss ph|0
Seven Lakes of San Pablo|Laguna|L|14.067|121.333|Lake|3000|1|kc ph rl|0
Hidden Valley Springs|Laguna|L|14.150|121.350|Nature|3500|1|sw rl|0
Taytay Falls|Laguna|L|14.150|121.470|Waterfall|3000|1|sw hk|0|6-11
Lake Caliraya|Laguna|L|14.310|121.520|Lake|3000|1|kc ad rl|0
Villa Escudero|Quezon|L|14.016|121.388|Heritage|3500|1|cw rl|0
Kamay ni Hesus|Quezon|L|14.120|121.570|Heritage|2500|1|cw ss|1
Mt. Banahaw|Quezon|L|14.070|121.490|Mountain|3500|2|hk cm|0
Cagbalete Island|Quezon|L|14.210|121.850|Beach|4000|2|sw rl|0|3-6
Real|Quezon|L|14.661|121.603|Surf|4000|2|sf sw|0|10-3
Polillo Island|Quezon|L|14.717|121.933|Island|5000|3|sw sn|0|3-6
Antipolo|Rizal|L|14.586|121.176|City|2500|1|ss fd cw|1
Pililla Wind Farm|Rizal|L|14.480|121.300|Nature|2500|1|ph bk|0
Masungi Georeserve|Rizal|L|14.560|121.290|Nature|3500|1|hk ph|1
Mt. Daraitan|Rizal|L|14.633|121.417|Mountain|2500|1|hk cv cm|0
Mt. Makiling|Laguna|L|14.130|121.200|Mountain|2500|1|hk wl|0
Naujan Lake|Oriental Mindoro|L|13.183|121.317|Lake|4000|2|kc wl|0
Tamaraw Falls|Oriental Mindoro|L|13.420|121.040|Waterfall|3500|1|sw ph|0|6-11
Mt. Halcon|Oriental Mindoro|L|13.280|121.000|Mountain|8000|5|hk cm|0|11-4
Bulalacao|Oriental Mindoro|L|12.317|121.333|Beach|5000|3|sw sn|0|3-6
Lubang Island|Occidental Mindoro|L|13.800|120.120|Island|5000|3|dv sn hk|0|3-6
Mt. Guiting-Guiting|Romblon|L|12.417|122.533|Mountain|8000|4|hk cm|0|3-5
Ticao Island|Masbate|L|12.700|123.700|Island|5500|3|dv sn sw|0|11-5
Cuyo Island|Palawan|L|10.850|121.000|Island|7000|3|sw cw ss|0|3-6
Calauit Safari Park|Palawan|L|12.164|119.944|Nature|6000|2|wl ss|0
Tabon Caves|Palawan|L|9.280|117.980|Cave|4500|2|cv cw|0
Taytay|Palawan|L|10.817|119.517|Heritage|5000|2|cw ss ih|0
San Vicente|Palawan|L|10.533|119.283|Beach|6000|3|sw rl ph|1
Ugong Rock|Palawan|L|9.870|118.770|Adventure|3500|1|ad cv ph|0
Capones Island|Zambales|L|14.940|119.980|Island|3500|1|sw ph ss|0|3-6
Liwliwa|Zambales|L|15.060|120.075|Surf|4000|2|sf sw cm|0|11-4
Dingalan|Aurora|L|15.390|121.390|Beach|4000|2|sw ph|0|3-6
Tuguegarao|Cagayan|L|17.613|121.727|City|4000|2|fd cw ss|0
Fuga Island|Cagayan|L|18.867|121.433|Island|8000|3|sw sn hk|0|3-6
Itbayat|Batanes|L|20.783|121.833|Island|14000|5|ss hk cw ph|0|3-6
Bagasbas Beach|Camarines Norte|L|14.120|122.970|Surf|4000|2|sf sw|0|11-4
Naga City|Camarines Sur|L|13.620|123.180|City|3500|2|fd cw ss|0
Mt. Isarog|Camarines Sur|L|13.658|123.300|Mountain|3000|2|hk ph|0
Lake Buhi|Camarines Sur|L|13.433|123.517|Lake|3500|1|kc ss|0
Legazpi City|Albay|L|13.139|123.744|City|4000|2|fd ss|0
Hoyop-Hoyopan Cave|Albay|L|13.180|123.660|Cave|3000|1|cv ph|0
Rizal Park|Manila|L|14.583|120.979|City|2500|1|ss cw bk|1
Bonifacio Global City|Metro Manila|L|14.551|121.050|City|3500|1|fd ss rl|0
Makati|Metro Manila|L|14.555|121.024|City|3500|1|fd ss|0
Quezon City|Metro Manila|L|14.676|121.044|City|3000|1|fd cw ss|0
Bomod-ok Falls|Mountain Province|L|17.080|120.900|Waterfall|5500|2|hk sw|0|6-11
Jawili Falls|Aklan|V|11.800|122.200|Waterfall|3500|1|sw hk|0|6-11
Bugtong Bato Falls|Antique|V|11.290|122.070|Waterfall|3500|1|sw hk|0|6-11
Mt. Madja-as|Antique|V|11.410|122.090|Mountain|3500|2|hk cm|0|11-4
Nogas Island|Antique|V|10.425|121.925|Island|4500|1|sn sw|0|3-6
Caluya Islands|Antique|V|11.933|121.533|Island|6000|3|sw sn|0|3-6
Pan de Azucar Island|Iloilo|V|11.470|123.080|Island|5000|2|hk sw ph|0|3-6
Jaro Cathedral|Iloilo|V|10.726|122.558|Heritage|3000|1|cw ss|0
Molo Church|Iloilo|V|10.697|122.545|Heritage|2500|1|cw ss|0
San Joaquin Church|Iloilo|V|10.583|122.090|Heritage|3000|1|cw ss ph|0
Panay Church|Capiz|V|11.583|122.750|Heritage|3000|1|cw ss|0
Silay|Negros Occidental|V|10.800|122.970|Heritage|3500|1|cw fd|0
The Ruins|Negros Occidental|V|10.744|122.936|Heritage|3500|1|ph ss|1
Lakawon Island|Negros Occidental|V|10.970|123.250|Island|4500|1|sw rl|0|3-6
Mt. Talinis|Negros Oriental|V|9.200|123.230|Mountain|3500|2|hk ph|0|11-4
Twin Lakes of Balinsasayao|Negros Oriental|V|9.333|123.167|Lake|3500|1|kc hk|0
Pulangbato Falls|Negros Oriental|V|9.220|123.190|Waterfall|3000|1|sw hk|0|6-11
Bais City|Negros Oriental|V|9.593|123.121|Nature|4500|1|wl ss|0
Manjuyod Sandbar|Negros Oriental|V|9.600|123.150|Beach|3500|1|sw ph|0|3-6
Dauin|Negros Oriental|V|9.190|123.265|Diving|5500|3|dv sn|1
Cambugahay Falls|Siquijor|V|9.130|123.630|Waterfall|3500|1|sw ph|1|6-11
Salagdoong Beach|Siquijor|V|9.190|123.650|Beach|3500|1|sw ph|0
Paliton Beach|Siquijor|V|9.190|123.500|Beach|3500|1|sw ph|1
Cantabon Cave|Siquijor|V|9.190|123.480|Cave|3500|1|cv hk|0
Sumilon Island|Cebu|V|9.440|123.400|Island|5500|1|sn sw|0|3-6
Tumalog Falls|Cebu|V|9.490|123.395|Waterfall|3500|1|sw ph|1|6-11
Mantayupan Falls|Cebu|V|10.080|123.530|Waterfall|3500|1|sw ph|0|6-11
Carcar|Cebu|V|10.106|123.640|Heritage|3000|1|cw fd|0
Pescador Island|Cebu|V|9.930|123.340|Diving|4000|1|dv sn|1
Gato Island|Cebu|V|11.283|124.150|Diving|6500|2|dv sn|0
Olango Island|Cebu|V|10.267|124.050|Island|4000|1|wl sn ss|0
Temple of Leah|Cebu|V|10.340|123.870|City|3500|1|ss ph|0
Simala Shrine|Cebu|V|10.017|123.583|Heritage|3000|1|cw ss|1
Loboc River|Bohol|V|9.633|124.000|Nature|4000|1|ss fd rl|1
Baclayon Church|Bohol|V|9.622|123.915|Heritage|3000|1|cw ss|1
Dauis Church|Bohol|V|9.617|123.867|Heritage|3000|1|cw ss|0
Hinagdanan Cave|Bohol|V|9.620|123.800|Cave|3500|1|cv sw|0
Mag-Aso Falls|Bohol|V|9.790|123.940|Waterfall|3500|1|sw hk|0|6-11
Pamilacan Island|Bohol|V|9.500|123.930|Island|5500|2|wl sn sw|0|3-6
Cabilao Island|Bohol|V|9.867|123.700|Diving|5500|2|dv sn|0|11-5
Ormoc|Leyte|V|11.006|124.608|City|3500|1|fd ss|0
Palo|Leyte|V|11.160|124.990|Heritage|3000|1|cw ss|0
Langun-Gobingob Caves|Samar|V|11.617|125.000|Cave|5500|2|cv hk|0
Lulugayan Falls|Samar|V|11.580|125.010|Waterfall|4500|2|sw hk|0|6-11
Tarangban Falls|Samar|V|12.067|124.600|Waterfall|4500|2|sw hk|0|6-11
Marabut|Samar|V|11.117|125.217|Nature|5000|2|ih sw|0|3-6
Guiuan Church|Eastern Samar|V|11.033|125.717|Heritage|3500|1|cw ss|0
Balangiga Church|Eastern Samar|V|11.100|125.380|Heritage|3500|1|cw ss|0
Capul Island|Northern Samar|V|12.433|124.267|Island|6500|3|cw ss ph|0
Ulan-Ulan Falls|Biliran|V|11.580|124.470|Waterfall|3500|1|sw hk|0|6-11
Cloud 9|Surigao del Norte|M|9.810|126.165|Surf|5000|2|sf ph|1|8-11
Daku Island|Surigao del Norte|M|9.733|126.133|Island|4500|1|sw ph|1
Guyam Island|Surigao del Norte|M|9.770|126.150|Island|4000|1|sw ph|1
Surigao City|Surigao del Norte|M|9.784|125.491|City|4500|2|fd ss|0
Mabua Pebble Beach|Surigao del Norte|M|9.840|125.490|Beach|3500|1|ss ph|0
Butuan|Agusan del Norte|M|8.949|125.543|Heritage|3500|2|cw ss fd|0
Mantigue Island|Camiguin|M|9.131|124.840|Island|4500|1|sn sw|0
Ardent Hot Springs|Camiguin|M|9.195|124.715|Nature|3500|1|rl sw|0
Iligan City|Lanao del Norte|M|8.228|124.245|City|3500|1|ss fd|0
Fort Pilar|Zamboanga del Sur|M|6.903|122.079|Heritage|2500|1|cw ss|1
Pasonanca Park|Zamboanga del Sur|M|6.983|122.033|Nature|3000|1|hk ph|0
Lake Wood|Zamboanga del Sur|M|7.817|123.150|Lake|4500|2|kc ss|0
Pagadian|Zamboanga del Sur|M|7.826|123.437|City|3500|1|fd ss|0
Simunul Island|Tawi-Tawi|M|4.940|119.820|Heritage|12000|4|cw ss|0
Mt. Kalatungan|Bukidnon|M|7.950|124.800|Mountain|5500|3|hk cm|0|11-4
Mt. Malindang|Misamis Occidental|M|8.217|123.633|Mountain|5000|3|hk cm|0|11-4
Kidapawan|Cotabato|M|7.008|125.089|City|3500|1|ss fd|0
Maitum|Sarangani|M|6.017|124.483|Heritage|5000|2|cw ss|0
Hagimit Falls|Davao del Norte|M|7.050|125.700|Waterfall|3500|1|sw|0|6-11
Mati|Davao Oriental|M|6.954|126.217|City|4500|2|sf sw ss|0
Maragusan Valley|Davao de Oro|M|7.300|126.100|Mountain|4500|2|hk ph|0
Malagos Garden Resort|Davao del Sur|M|7.190|125.450|Nature|3000|1|wl ph rl|0
Asik-Asik Falls|Cotabato|M|7.383|124.567|Waterfall|4500|2|sw ph|1
National Museum of Fine Arts|Manila|L|14.5866|120.9812|Heritage|1500|1|cw ss ph|1
National Museum of Anthropology|Manila|L|14.5867|120.9815|Heritage|1500|1|cw ss ph|1
National Museum of Natural History|Manila|L|14.5859|120.9818|Heritage|1500|1|wl ss ph|1
Fort Santiago|Manila|L|14.5958|120.9672|Heritage|1500|1|cw ss ph|1
Manila Cathedral|Manila|L|14.5911|120.9737|Heritage|1000|1|cw ss|0
San Agustin Church|Manila|L|14.5890|120.9753|Heritage|1200|1|cw ss ph|1
Casa Manila|Manila|L|14.5892|120.9751|Heritage|1200|1|cw ss|0
Roxas Boulevard Baywalk|Manila|L|14.5757|120.9770|City|1000|1|ss ph rl|0
Quiapo Church|Manila|L|14.5990|120.9835|Heritage|1000|1|cw ss|0
Manila Ocean Park|Manila|L|14.5790|120.9755|City|2500|1|wl ss|0
Manila American Cemetery|Metro Manila|L|14.5376|121.0442|Heritage|1000|1|cw ss ph|0
Ayala Museum|Metro Manila|L|14.5535|121.0236|Heritage|1500|1|cw ss|0
Greenbelt|Metro Manila|L|14.5528|121.0211|City|2500|1|fd ss rl|0
Poblacion Makati|Metro Manila|L|14.5648|121.0300|City|2500|1|fd ss|0
The Mind Museum|Metro Manila|L|14.5521|121.0454|City|1500|1|ss ph|0
Escolta Street|Manila|L|14.5990|120.9788|Heritage|1000|1|cw ph fd|0
Quezon Memorial Circle|Metro Manila|L|14.6514|121.0494|City|1000|1|bk ph rl|0
La Mesa Eco Park|Metro Manila|L|14.7194|121.0766|Nature|1500|1|hk bk rl|0
Cubao Expo|Metro Manila|L|14.6230|121.0546|City|1500|1|fd ss ph|0
Las Piñas Bamboo Organ|Metro Manila|L|14.4393|120.9985|Heritage|1200|1|cw ss|0
Mall of Asia|Metro Manila|L|14.5350|120.9822|City|2500|1|fd ss rl|1
Marikina Shoe Museum|Metro Manila|L|14.6330|121.0980|Heritage|1200|1|cw ss|0
Manila Chinese Cemetery|Manila|L|14.6392|120.9992|Heritage|1200|1|cw ss ph|0
Metropolitan Museum of Manila|Metro Manila|L|14.5502|120.9942|Heritage|1500|1|cw ss|0
Coconut Palace|Metro Manila|L|14.5532|120.9885|Heritage|1500|1|cw ss ph|0
Manila Central Post Office|Manila|L|14.5937|120.9795|Heritage|1000|1|cw ph|0
Paco Park|Manila|L|14.5806|120.9922|Heritage|1000|1|cw rl ph|0
Tam-awan Village|Benguet|L|16.4283|120.5700|Heritage|3500|1|cw ph ss|0
Burnham Park|Benguet|L|16.4120|120.5934|City|2500|1|bk rl ss|1
Mines View Park|Benguet|L|16.4177|120.6275|City|2500|1|ss ph|0
Camp John Hay|Benguet|L|16.4000|120.6200|Nature|3500|1|hk bk rl|0
Kiltepan Peak|Mountain Province|L|17.0980|120.9150|Mountain|5500|2|hk ph|0|11-4
Sumaguing Cave|Mountain Province|L|17.0800|120.9050|Cave|5500|1|cv hk|1
Echo Valley|Mountain Province|L|17.0903|120.9016|Heritage|5000|1|hk cw ph|1
Bangaan Rice Terraces|Ifugao|L|16.9392|121.0725|Heritage|6000|2|hk cw ph|0
Hungduan Rice Terraces|Ifugao|L|16.7778|121.0869|Heritage|6000|2|hk ph cw|0
Tappiya Falls|Ifugao|L|16.9111|121.0956|Waterfall|6000|1|sw hk|0|6-11
Blue Lagoon Pagudpud|Ilocos Norte|L|18.5850|120.8000|Beach|5500|2|sw ph|1|3-6
Kabigan Falls|Ilocos Norte|L|18.5272|120.8183|Waterfall|5000|1|sw hk|0|6-11
Patapat Viaduct|Ilocos Norte|L|18.5744|120.8467|Nature|4500|1|ph ss|0
Paoay Lake|Ilocos Norte|L|18.1050|120.5400|Lake|4000|1|ss rl bk|0
Batac City|Ilocos Norte|L|18.0558|120.5667|City|3500|1|fd cw|0
Calle Crisologo|Ilocos Sur|L|17.5747|120.3869|Heritage|3500|1|cw ss ph|1
Bangued|Abra|L|17.5958|120.6178|City|4000|2|ss fd cw|0
Naidi Hills Lighthouse|Batanes|L|20.4350|121.9750|Heritage|5000|1|ss ph|0|3-6
Vayang Rolling Hills|Batanes|L|20.4667|121.9667|Nature|5000|1|ph ss|1|3-6
Valugan Boulder Beach|Batanes|L|20.4090|121.9350|Beach|5000|1|ph ss|0|3-6
Bolinao Falls|Pangasinan|L|16.3270|119.8960|Waterfall|3500|1|sw|0|6-11
Patar Beach|Pangasinan|L|16.3792|119.7917|Beach|3500|2|sw rl ss|0|3-6
Tondol Beach|Pangasinan|L|16.2675|119.9722|Beach|3500|2|sw sf ph|0|3-6
Poro Point Lighthouse|La Union|L|16.6081|120.2817|Heritage|3000|1|ss ph|0
Ma-Cho Temple|La Union|L|16.6153|120.3170|Heritage|3000|1|cw ph|0
Zoobic Safari|Zambales|L|14.8333|120.2833|Nature|3500|1|wl ad|0
Angeles City|Pampanga|L|15.1450|120.5887|City|3500|1|fd ss|0
Betis Church|Pampanga|L|14.9910|120.6320|Heritage|3000|1|cw ss ph|0
Bacolor Church|Pampanga|L|14.9974|120.6558|Heritage|3000|1|cw ss ph|0
San Fernando, Pampanga|Pampanga|L|15.0286|120.6898|City|3500|1|fd cw ss|0
Minalungao National Park|Nueva Ecija|L|15.5300|121.1000|Nature|3500|1|kc sw ph|0|11-5
Pantabangan Lake|Nueva Ecija|L|15.8167|121.1167|Lake|4000|2|kc ph rl|0
Daranak Falls|Rizal|L|14.5158|121.4147|Waterfall|2500|1|sw rl|1|6-11
Hinulugang Taktak|Rizal|L|14.5967|121.1894|Waterfall|2000|1|ph ss|0|6-11
Wawa Dam|Rizal|L|14.7500|121.2000|Nature|2500|1|ph ss|0
Mt. Pamitinan|Rizal|L|14.7000|121.1833|Mountain|2500|1|hk cv|0
Tinipak River|Rizal|L|14.5500|121.4500|Nature|2500|1|hk sw|0|11-5
Sky Ranch Tagaytay|Cavite|L|14.0897|120.9380|City|3000|1|ss rl|0
People's Park in the Sky|Cavite|L|14.0911|120.9433|City|2500|1|ss ph|0
Picnic Grove|Cavite|L|14.1031|120.9439|Nature|2500|1|rl ss|0
Bonifacio Trial House|Cavite|L|14.2667|120.7333|Heritage|3000|1|cw ss|0
Las Piñas-Parañaque Wetland Park|Metro Manila|L|14.4889|120.9833|Nature|1500|1|wl ph bk|0|11-3
Rizal Shrine Calamba|Laguna|L|14.2111|121.1647|Heritage|2500|1|cw ss|0
Pansol Hot Springs|Laguna|L|14.1833|121.1833|Nature|2500|1|rl|0
Enchanted Kingdom|Laguna|L|14.2933|121.0536|Adventure|3500|1|ad|0
Liliw|Laguna|L|14.1269|121.4361|Heritage|2500|1|cw fd ss|0
Paete|Laguna|L|14.3667|121.4833|Heritage|2500|1|cw ph|0
Matabungkay Beach|Batangas|L|14.0340|120.6330|Beach|3500|1|sw rl|0|3-6
Lipa|Batangas|L|13.9411|121.1624|City|3000|1|fd ss|0
Calapan City|Oriental Mindoro|L|13.4119|121.1803|City|3500|1|fd ss|0
Boac|Marinduque|L|13.4472|121.8403|Heritage|4000|2|cw ss|0
Maniwaya Island|Marinduque|L|13.5000|122.0167|Island|4500|2|sw rl|0|3-6
Poctoy White Beach|Marinduque|L|13.3167|122.0833|Beach|4000|2|sw rl|0|3-6
Bonbon Beach|Romblon|L|12.5583|122.2833|Beach|4500|2|sw ph|0|3-6
Fort San Andres|Romblon|L|12.5772|122.2711|Heritage|4000|1|cw ss ph|0
Cantingas River|Romblon|L|12.4083|122.5500|Nature|5500|1|kc sw|0|11-5
Nagtabon Beach|Palawan|L|9.9800|118.7200|Beach|4500|1|sw rl|0
Twin Lagoon|Palawan|L|11.9667|120.0833|Island|8000|1|sw sn|0
Siete Pecados Marine Park|Palawan|L|11.9917|120.2000|Diving|7500|1|sn dv|0
Mt. Tapyas|Palawan|L|11.9962|120.2122|Mountain|5500|1|hk ph|1
Miniloc Island|Palawan|L|11.1900|119.3600|Island|7500|1|ih sn kc|1
Cadlao Island|Palawan|L|11.2000|119.4000|Island|7000|1|kc sn ph|0
Taraw Cliff|Palawan|L|11.1833|119.4000|Adventure|5500|1|hk ph ad|0
Maquinit Hot Spring|Palawan|L|11.9833|120.1667|Nature|5000|1|rl|0
Subic Beach Matnog|Sorsogon|L|12.5833|124.0833|Beach|4000|2|sw rl|0|3-6
Sorsogon City|Sorsogon|L|12.9714|124.0058|City|3500|1|fd ss|0
Virac|Catanduanes|L|13.5833|124.2333|City|4500|2|ss fd|0
Maribina Falls|Catanduanes|L|13.6000|124.3000|Waterfall|4500|1|sw hk|0|6-11
Bato Church|Catanduanes|L|13.6030|124.3400|Heritage|4000|1|cw ss|0
Masbate City|Masbate|L|12.3667|123.6167|City|4500|2|ss fd|0
Daraga Church|Albay|L|13.1583|123.7000|Heritage|3000|1|cw ss ph|1
Ligñon Hill Nature Park|Albay|L|13.1500|123.7333|Nature|3500|1|hk ph ad|0
Dicasalarin Cove|Aurora|L|15.3333|121.4000|Beach|4500|2|sw ph|0|3-6
Diguisit Rock Formation|Aurora|L|15.7833|121.5833|Nature|4500|1|ph ss|0
Museo de Baler|Aurora|L|15.7581|121.5621|Heritage|3500|1|cw ss|0
Aurora Balete Tree|Aurora|L|15.7778|121.4833|Nature|4000|1|ph ss|0
Saud Beach|Ilocos Norte|L|18.5714|120.7778|Beach|5000|2|sw rl ph|1|3-6
Magellan's Cross|Cebu|V|10.2936|123.9020|Heritage|3000|1|cw ss|1
Basilica del Santo Niño|Cebu|V|10.2941|123.9015|Heritage|3000|1|cw ss|1
Fort San Pedro|Cebu|V|10.2925|123.9054|Heritage|3000|1|cw ss ph|1
Taoist Temple Cebu|Cebu|V|10.3350|123.8913|Heritage|3000|1|cw ss ph|0
Tops Lookout|Cebu|V|10.3411|123.8639|City|3000|1|ss ph|0
Lake Danao Camotes|Cebu|V|10.6667|124.4167|Lake|4500|1|kc rl|0
Argao|Cebu|V|9.8805|123.6044|Heritage|3000|1|cw fd|0
Santa Fe Beach|Cebu|V|11.1667|123.8000|Beach|5000|2|sw rl|0|3-6
Bohol Bee Farm|Bohol|V|9.5833|123.7667|Nature|3500|1|fd rl|1
Alona Beach|Bohol|V|9.5500|123.7767|Beach|6500|2|sw dv rl|1
Dumaluan Beach|Bohol|V|9.5733|123.8000|Beach|5500|2|sw rl|0
Bilar Man-made Forest|Bohol|V|9.7167|124.1167|Nature|3500|1|ph ss|0
Sagbayan Peak|Bohol|V|9.9333|124.1000|Nature|3500|1|ph ss|0
Punta Cruz Watchtower|Bohol|V|9.7500|123.8000|Heritage|3000|1|cw ss ph|0
Balay Negrense|Negros Occidental|V|10.8050|122.9740|Heritage|3000|1|cw ss|0
Dumaguete Belfry|Negros Oriental|V|9.3059|123.3066|Heritage|2500|1|cw ss|0
Rizal Boulevard|Negros Oriental|V|9.3044|123.3100|City|2500|1|rl fd ss|1
Sipaway Island|Negros Occidental|V|10.4900|123.4200|Beach|4500|2|sw rl|0|3-6
Puka Shell Beach|Aklan|V|11.9833|121.9167|Beach|8000|2|sw rl|1
Mt. Luho|Aklan|V|11.9667|121.9167|Nature|7000|1|ph ss|0
Willy's Rock|Aklan|V|11.9583|121.9275|Nature|7000|1|ph ss|1
Bulabog Beach|Aklan|V|11.9667|121.9333|Beach|7500|2|sw sf ad|0|11-3
Iloilo Esplanade|Iloilo|V|10.7000|122.5700|City|3500|1|bk rl ss|0
Guisi Lighthouse|Guimaras|V|10.5167|122.6300|Heritage|4000|1|ss ph|0
Baybay Beach Roxas|Capiz|V|11.6167|122.7500|Beach|3500|1|sw rl fd|0
San Juanico Bridge|Leyte|V|11.2956|125.0053|Heritage|3500|1|ph ss|1
Santo Niño Shrine|Leyte|V|11.2400|125.0050|Heritage|3500|1|cw ss|0
Ogtong Cave|Cebu|V|11.2167|123.7167|Cave|5000|1|cv sw|0
Timubo Cave|Cebu|V|10.6333|124.4333|Cave|4500|1|cv sw|0
Mactan Shrine|Cebu|V|10.3167|124.0000|Heritage|2500|1|cw ss|0
Casa Gorordo Museum|Cebu|V|10.2933|123.9040|Heritage|3000|1|cw ss|0
Cabagnow Cave Pool|Bohol|V|9.7333|124.5667|Cave|4500|1|cv sw|0
Monad Shoal|Cebu|V|11.3333|124.1333|Diving|7500|2|dv|1
Panagsama Beach|Cebu|V|9.9400|123.3800|Beach|5500|2|dv sn rl|1
Virgin Island Panglao|Bohol|V|9.6000|123.8667|Island|5000|1|sw ph|1
Capitol Park and Lagoon|Negros Occidental|V|10.6769|122.9511|City|3000|1|rl ss|0
Manokan Country|Negros Occidental|V|10.6694|122.9450|City|3000|1|fd|1
Bakhawan Eco-Park|Aklan|V|11.7000|122.3667|Nature|3500|1|kc bk ss|0
Mararison Island|Antique|V|11.4167|122.0333|Island|5500|2|sw sn|0|3-6
Alubihod Beach|Guimaras|V|10.5167|122.6000|Beach|4500|2|sw rl|0|3-6
Bojo River Cruise|Cebu|V|10.2167|123.5500|Nature|3500|1|kc ss|0
Moalboal White Beach|Cebu|V|9.9500|123.3833|Beach|5000|2|sw rl|0
Tingko Beach|Cebu|V|9.7000|123.5000|Beach|4000|1|sw rl|0
Boljoon Church|Cebu|V|9.6167|123.4833|Heritage|3000|1|cw ss ph|0
Maasin Cathedral|Southern Leyte|V|10.1333|124.8333|Heritage|3500|1|cw ss|0
Lazi Church|Siquijor|V|9.1333|123.6000|Heritage|3000|1|cw ss ph|0
Enchanted Balete Tree|Siquijor|V|9.1500|123.6167|Nature|3000|1|ph ss|0
Bukilat Cave|Cebu|V|10.6000|124.4000|Cave|4500|1|cv ph|0
Loboc Church|Bohol|V|9.6333|124.0333|Heritage|3000|1|cw ss ph|0
Diniwid Beach|Aklan|V|11.9892|121.9122|Beach|7500|2|sw rl|0
Ariel's Point|Aklan|V|11.9167|121.8833|Island|7500|1|sw sn ad|1
Crocodile Island|Aklan|V|11.9333|121.9333|Island|7000|1|sn sw|0
Cabugao Gamay Island|Iloilo|V|11.6000|123.3667|Island|6500|2|ih sw ph|1|3-6
Tangke Lagoon|Iloilo|V|11.6167|123.3333|Nature|6500|1|sw ph|1
Bucari Pine Forest|Iloilo|V|10.7500|122.3833|Nature|3500|1|rl cm ph|0
Banacon Island|Bohol|V|10.1833|124.1167|Island|4000|1|kc ph|0
Calbayog City|Samar|V|12.0667|124.6000|City|3500|1|fd ss|0
Pacifico Beach|Surigao del Norte|M|9.9600|126.0600|Beach|6000|2|sf sw ph|0|8-11
Davao Crocodile Park|Davao del Sur|M|7.0975|125.6322|Nature|3500|1|wl ss|1
People's Park Davao|Davao del Sur|M|7.0733|125.6128|City|2500|1|rl ss|0
Jack's Ridge|Davao del Sur|M|7.0900|125.6000|City|3000|1|ss fd ph|0
Monfort Bat Cave|Davao del Norte|M|7.0700|125.7200|Cave|4000|1|wl ss|0
Talikud Island|Davao del Norte|M|6.9167|125.7000|Island|5500|2|sn dv sw|0|3-6
Kablon Farm|South Cotabato|M|6.3333|124.9500|Nature|3000|1|ss fd ph|0
General Santos Fish Port|South Cotabato|M|6.0833|125.1333|City|3000|1|fd ph|0
Tandag|Surigao del Sur|M|9.0783|126.1986|City|4000|2|ss fd|0
Malaybalay|Bukidnon|M|8.1467|125.1275|City|3500|1|ss fd|0
Del Monte Pineapple Plantation|Bukidnon|M|8.3667|124.8667|Nature|3500|1|ss ph|0
Monastery of the Transfiguration|Bukidnon|M|8.1167|125.1000|Heritage|3000|1|cw rl|0
Sunken Cemetery|Camiguin|M|9.1300|124.6600|Heritage|4000|1|ss ph|1
Old Vulcan Church|Camiguin|M|9.1333|124.6500|Heritage|4000|1|cw ph|0
Mt. Hibok-Hibok|Camiguin|M|9.2000|124.6833|Mountain|5500|2|hk ph|0|11-4
Santo Niño Cold Spring|Camiguin|M|9.1833|124.7167|Nature|3500|1|sw rl|0
Macahambus Cave|Misamis Oriental|M|8.4500|124.7000|Cave|3000|1|cv hk|0
Mapawa Nature Park|Misamis Oriental|M|8.4333|124.6167|Nature|3000|1|hk ss rl|0
Gingoog City|Misamis Oriental|M|8.8167|125.1000|City|3500|1|ss fd|0
Limunsudan Falls|Lanao del Norte|M|8.0000|124.1500|Waterfall|6000|3|hk sw|0|11-5
Mimbalot Falls|Lanao del Norte|M|8.2167|124.2167|Waterfall|3500|1|sw ph|0|6-11
Paseo del Mar|Zamboanga del Sur|M|6.9017|122.0742|City|2500|1|rl fd ss|0
Plaza Pershing|Zamboanga del Sur|M|6.9114|122.0764|Heritage|2500|1|cw ss|0
Pujada Island|Davao Oriental|M|6.9000|126.3000|Island|5000|1|sw sn|0|3-6
Tagum City|Davao del Norte|M|7.4478|125.8078|City|3500|1|ss fd|0
Gaston Park|Misamis Oriental|M|8.4803|124.6475|City|2500|1|ss rl|0
Gardens of Malasag|Misamis Oriental|M|8.5000|124.7000|Nature|3000|1|hk ph|0
Del Carmen Mangrove Forest|Surigao del Norte|M|9.8667|125.9667|Nature|4500|1|kc ph|0
Balangay Shrine Museum|Agusan del Norte|M|8.9300|125.5300|Heritage|3000|1|cw ss|0
Our Lady of Triumph Cathedral|Misamis Occidental|M|8.1458|123.8447|Heritage|3000|1|cw ss|0
Rizal Shrine Dapitan|Zamboanga del Norte|M|8.6542|123.4222|Heritage|3000|1|cw ss|0
Dipolog Boulevard|Zamboanga del Norte|M|8.5833|123.3333|City|2500|1|rl ss|0
Seven Falls Lake Sebu|South Cotabato|M|6.2017|124.6700|Waterfall|5500|2|hk ph ad|0
Lake Seloton|South Cotabato|M|6.2000|124.6833|Lake|5000|2|kc ss cw|0
Cagwait White Beach|Surigao del Sur|M|8.9333|126.2833|Beach|4500|2|sw rl|0|3-6
Bislig City|Surigao del Sur|M|8.2133|126.3228|City|4500|2|ss fd|0
Cabadbaran|Agusan del Norte|M|9.1167|125.5333|City|3500|1|ss cw|0
Oroquieta City|Misamis Occidental|M|8.4833|123.8000|City|3500|1|ss fd|0
Dipolog Cathedral|Zamboanga del Norte|M|8.5844|123.3414|Heritage|2500|1|cw ss|0`;
