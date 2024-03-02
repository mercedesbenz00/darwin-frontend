/**
 * Array<256> item is parseInt(HEX, 16) number
 * TDOO: We should replace with GLSL shader once we will introduce WebGL context
 */
export const C_MAPS = {
  /* eslint-disable max-len */
  default: [4278190080, 4278255873, 4278321666, 4278387459, 4278453252, 4278519045, 4278584838, 4278650631, 4278716424, 4278782217, 4278848010, 4278913803, 4278979596, 4279045389, 4279111182, 4279176975, 4279242768, 4279308561, 4279374354, 4279440147, 4279505940, 4279571733, 4279637526, 4279703319, 4279769112, 4279834905, 4279900698, 4279966491, 4280032284, 4280098077, 4280163870, 4280229663, 4280295456, 4280361249, 4280427042, 4280492835, 4280558628, 4280624421, 4280690214, 4280756007, 4280821800, 4280887593, 4280953386, 4281019179, 4281084972, 4281150765, 4281216558, 4281282351, 4281348144, 4281413937, 4281479730, 4281545523, 4281611316, 4281677109, 4281742902, 4281808695, 4281874488, 4281940281, 4282006074, 4282071867, 4282137660, 4282203453, 4282269246, 4282335039, 4282400832, 4282466625, 4282532418, 4282598211, 4282664004, 4282729797, 4282795590, 4282861383, 4282927176, 4282992969, 4283058762, 4283124555, 4283190348, 4283256141, 4283321934, 4283387727, 4283453520, 4283519313, 4283585106, 4283650899, 4283716692, 4283782485, 4283848278, 4283914071, 4283979864, 4284045657, 4284111450, 4284177243, 4284243036, 4284308829, 4284374622, 4284440415, 4284506208, 4284572001, 4284637794, 4284703587, 4284769380, 4284835173, 4284900966, 4284966759, 4285032552, 4285098345, 4285164138, 4285229931, 4285295724, 4285361517, 4285427310, 4285493103, 4285558896, 4285624689, 4285690482, 4285756275, 4285822068, 4285887861, 4285953654, 4286019447, 4286085240, 4286151033, 4286216826, 4286282619, 4286348412, 4286414205, 4286479998, 4286545791, 4286611584, 4286677377, 4286743170, 4286808963, 4286874756, 4286940549, 4287006342, 4287072135, 4287137928, 4287203721, 4287269514, 4287335307, 4287401100, 4287466893, 4287532686, 4287598479, 4287664272, 4287730065, 4287795858, 4287861651, 4287927444, 4287993237, 4288059030, 4288124823, 4288190616, 4288256409, 4288322202, 4288387995, 4288453788, 4288519581, 4288585374, 4288651167, 4288716960, 4288782753, 4288848546, 4288914339, 4288980132, 4289045925, 4289111718, 4289177511, 4289243304, 4289309097, 4289374890, 4289440683, 4289506476, 4289572269, 4289638062, 4289703855, 4289769648, 4289835441, 4289901234, 4289967027, 4290032820, 4290098613, 4290164406, 4290230199, 4290295992, 4290361785, 4290427578, 4290493371, 4290559164, 4290624957, 4290690750, 4290756543, 4290822336, 4290888129, 4290953922, 4291019715, 4291085508, 4291151301, 4291217094, 4291282887, 4291348680, 4291414473, 4291480266, 4291546059, 4291611852, 4291677645, 4291743438, 4291809231, 4291875024, 4291940817, 4292006610, 4292072403, 4292138196, 4292203989, 4292269782, 4292335575, 4292401368, 4292467161, 4292532954, 4292598747, 4292664540, 4292730333, 4292796126, 4292861919, 4292927712, 4292993505, 4293059298, 4293125091, 4293190884, 4293256677, 4293322470, 4293388263, 4293454056, 4293519849, 4293585642, 4293651435, 4293717228, 4293783021, 4293848814, 4293914607, 4293980400, 4294046193, 4294111986, 4294177779, 4294243572, 4294309365, 4294375158, 4294440951, 4294506744, 4294572537, 4294638330, 4294704123, 4294769916, 4294835709, 4294901502, 4294967295],
  bone: [4278190080, 4278255616, 4278321409, 4278387202, 4278452995, 4278584324, 4278650117, 4278715910, 4278781447, 4278847239, 4278978568, 4279044361, 4279110154, 4279175947, 4279307276, 4279373069, 4279438606, 4279504398, 4279570191, 4279701520, 4279767313, 4279833106, 4279898899, 4280030228, 4280095765, 4280161557, 4280227350, 4280293143, 4280424472, 4280490265, 4280556058, 4280621851, 4280687388, 4280818716, 4280884509, 4280950302, 4281016095, 4281147424, 4281213217, 4281279010, 4281344547, 4281410339, 4281541668, 4281607461, 4281673254, 4281739047, 4281870376, 4281936169, 4282001706, 4282067498, 4282133291, 4282264620, 4282330413, 4282396206, 4282461999, 4282527792, 4282658865, 4282724657, 4282790450, 4282856243, 4282987572, 4283053365, 4283119158, 4283184951, 4283250488, 4283381816, 4283447609, 4283513402, 4283579195, 4283710524, 4283776317, 4283842110, 4283907647, 4283973439, 4284104768, 4284170561, 4284236354, 4284302147, 4284367940, 4284499269, 4284564806, 4284630598, 4284696391, 4284827720, 4284893513, 4284959306, 4285025099, 4285090892, 4285221965, 4285287757, 4285353550, 4285419343, 4285550672, 4285616465, 4285682258, 4285682515, 4285748308, 4285814356, 4285880149, 4285945942, 4286011735, 4286077528, 4286143577, 4286143834, 4286209627, 4286275419, 4286341212, 4286407261, 4286473054, 4286538847, 4286604640, 4286604897, 4286670946, 4286736738, 4286802531, 4286868324, 4286934373, 4287000166, 4287065959, 4287066216, 4287132009, 4287198057, 4287263850, 4287329643, 4287395436, 4287461229, 4287527278, 4287527535, 4287593328, 4287659120, 4287724913, 4287790962, 4287856755, 4287922548, 4287988341, 4287988598, 4288054647, 4288120439, 4288186232, 4288252025, 4288317818, 4288383867, 4288449660, 4288449917, 4288515710, 4288581502, 4288647551, 4288713344, 4288779137, 4288844930, 4288910723, 4288911236, 4288977029, 4289042821, 4289108614, 4289174407, 4289240456, 4289306249, 4289372042, 4289372299, 4289438092, 4289504140, 4289569933, 4289635726, 4289701519, 4289767312, 4289833361, 4289833618, 4289899411, 4289965203, 4290030996, 4290097045, 4290162838, 4290228631, 4290294424, 4290294681, 4290360730, 4290426522, 4290492315, 4290558108, 4290624157, 4290689950, 4290755743, 4290756000, 4290821793, 4290887841, 4290953634, 4291019427, 4291085220, 4291151013, 4291217062, 4291217319, 4291282856, 4291348650, 4291414443, 4291480236, 4291546030, 4291611823, 4291677617, 4291677874, 4291743411, 4291809205, 4291874998, 4291940791, 4292006585, 4292072378, 4292138172, 4292138429, 4292203966, 4292269760, 4292335553, 4292401346, 4292467140, 4292532933, 4292598726, 4292598984, 4292664521, 4292730315, 4292796108, 4292861901, 4292927695, 4292993488, 4293059281, 4293059539, 4293125076, 4293190869, 4293256663, 4293322456, 4293388250, 4293454043, 4293519836, 4293520094, 4293585631, 4293651424, 4293717218, 4293783011, 4293848805, 4293914598, 4293980391, 4293980649, 4294046186, 4294111979, 4294177773, 4294243566, 4294309359, 4294375153, 4294440946, 4294441204, 4294506741, 4294572534, 4294638328, 4294704121, 4294769914, 4294835708, 4294901501, 4294967295],
  jet: [4286513152, 4286840832, 4287102976, 4287430656, 4287692800, 4288020480, 4288282624, 4288610304, 4288872448, 4289200128, 4289462272, 4289789952, 4290117632, 4290379776, 4290707456, 4290969600, 4291297280, 4291559424, 4291887104, 4292149248, 4292476928, 4292739072, 4293066752, 4293394432, 4293656576, 4293984256, 4294246400, 4294574080, 4294836224, 4294901760, 4294901760, 4294901760, 4294901760, 4294902784, 4294903808, 4294904832, 4294905856, 4294906880, 4294907904, 4294908928, 4294909952, 4294910976, 4294912000, 4294913024, 4294914048, 4294915072, 4294916096, 4294917120, 4294918144, 4294919168, 4294920192, 4294921216, 4294922240, 4294923264, 4294924288, 4294925312, 4294926336, 4294927360, 4294928384, 4294929408, 4294930432, 4294931456, 4294932480, 4294933504, 4294934528, 4294935552, 4294936576, 4294937600, 4294938624, 4294939648, 4294940672, 4294941696, 4294942720, 4294943744, 4294944768, 4294945792, 4294946816, 4294947840, 4294948864, 4294949888, 4294950912, 4294951936, 4294952960, 4294953984, 4294955008, 4294956032, 4294957056, 4294892544, 4294631424, 4294435840, 4294240258, 4294044677, 4293783560, 4293587980, 4293392399, 4293196818, 4293000981, 4292738840, 4292542236, 4292345631, 4292149026, 4291886885, 4291690281, 4291493676, 4291297071, 4291034930, 4290838326, 4290641721, 4290445116, 4290248511, 4289986370, 4289789766, 4289593161, 4289396556, 4289134415, 4288937811, 4288741206, 4288544601, 4288347996, 4288085855, 4287889251, 4287692646, 4287496041, 4287233900, 4287037296, 4286840691, 4286644086, 4286447481, 4286185340, 4285988736, 4285792131, 4285595526, 4285333385, 4285136781, 4284940176, 4284743571, 4284481430, 4284284826, 4284088221, 4283891616, 4283695011, 4283432870, 4283236266, 4283039661, 4282843056, 4282580915, 4282384311, 4282187706, 4281991101, 4281794496, 4281532355, 4281335751, 4281139146, 4280942541, 4280680400, 4280483796, 4280287191, 4280090586, 4279828445, 4279631840, 4279435236, 4279238631, 4279042026, 4278779885, 4278582513, 4278384884, 4278252791, 4278251770, 4278251006, 4278249983, 4278248959, 4278248191, 4278247167, 4278246143, 4278245375, 4278244351, 4278243327, 4278242303, 4278241535, 4278240511, 4278239487, 4278238719, 4278237695, 4278236671, 4278235647, 4278234879, 4278233855, 4278232831, 4278232063, 4278231039, 4278230015, 4278229247, 4278228223, 4278227199, 4278226175, 4278225407, 4278224383, 4278223359, 4278222591, 4278221567, 4278220543, 4278219775, 4278218751, 4278217727, 4278216703, 4278215935, 4278214911, 4278213887, 4278213119, 4278212095, 4278211071, 4278210047, 4278209279, 4278208255, 4278207231, 4278206463, 4278205439, 4278204415, 4278203647, 4278202623, 4278201599, 4278200575, 4278199807, 4278198783, 4278197759, 4278196991, 4278195967, 4278194942, 4278194170, 4278193141, 4278192113, 4278191084, 4278190312, 4278190307, 4278190302, 4278190298, 4278190293, 4278190289, 4278190284, 4278190280, 4278190275, 4278190271, 4278190266, 4278190262, 4278190257, 4278190252, 4278190248, 4278190243, 4278190239, 4278190234, 4278190230, 4278190225, 4278190221, 4278190216, 4278190212, 4278190207],
  hot: [4294246399, 4294180863, 4293984255, 4293853183, 4293656575, 4293525503, 4293328895, 4293132287, 4293001215, 4292804607, 4292607999, 4292476927, 4292280319, 4292149247, 4291952639, 4291756031, 4291624959, 4291428351, 4291231743, 4291100671, 4290904063, 4290772991, 4290576383, 4290379775, 4290248703, 4290052095, 4289855487, 4289724415, 4289527807, 4289396735, 4289200127, 4289003519, 4288872447, 4288675839, 4288479231, 4288348159, 4288151551, 4288020479, 4287823871, 4287627263, 4287496191, 4287299583, 4287102975, 4286971903, 4286775295, 4286644223, 4286447615, 4286251007, 4286119935, 4285923327, 4285726719, 4285595647, 4285399039, 4285267967, 4285071359, 4284874751, 4284743679, 4284547071, 4284350463, 4284219391, 4284022783, 4283891711, 4283695103, 4283498495, 4283367423, 4283170815, 4282974207, 4282843135, 4282646527, 4282515455, 4282318847, 4282122239, 4281991167, 4281794559, 4281597951, 4281466879, 4281270271, 4281139199, 4280942591, 4280745983, 4280614911, 4280418303, 4280221695, 4280090623, 4279894015, 4279762943, 4279566335, 4279369727, 4279238655, 4279042047, 4278845439, 4278714367, 4278517759, 4278386687, 4278255359, 4278254591, 4278254079, 4278253311, 4278252543, 4278252031, 4278251263, 4278250751, 4278249983, 4278249215, 4278248703, 4278247935, 4278247167, 4278246655, 4278245887, 4278245375, 4278244607, 4278243839, 4278243327, 4278242559, 4278241791, 4278241279, 4278240511, 4278239999, 4278239231, 4278238463, 4278237951, 4278237183, 4278236415, 4278235903, 4278235135, 4278234623, 4278233855, 4278233087, 4278232575, 4278231807, 4278231039, 4278230527, 4278229759, 4278229247, 4278228479, 4278227711, 4278227199, 4278226431, 4278225663, 4278225151, 4278224383, 4278223871, 4278223103, 4278222335, 4278221823, 4278221055, 4278220287, 4278219775, 4278219007, 4278218495, 4278217727, 4278216959, 4278216447, 4278215679, 4278214911, 4278214399, 4278213631, 4278213119, 4278212351, 4278211583, 4278211071, 4278210303, 4278209535, 4278209023, 4278208255, 4278207743, 4278206975, 4278206207, 4278205695, 4278204927, 4278204159, 4278203647, 4278202879, 4278202367, 4278201599, 4278200831, 4278200319, 4278199551, 4278198783, 4278198271, 4278197503, 4278196991, 4278196223, 4278195455, 4278194943, 4278194175, 4278193407, 4278192895, 4278192127, 4278191615, 4278190847, 4278190333, 4278190330, 4278190326, 4278190322, 4278190318, 4278190314, 4278190310, 4278190306, 4278190302, 4278190299, 4278190295, 4278190291, 4278190287, 4278190283, 4278190279, 4278190275, 4278190271, 4278190267, 4278190263, 4278190259, 4278190255, 4278190251, 4278190247, 4278190243, 4278190239, 4278190236, 4278190232, 4278190228, 4278190224, 4278190220, 4278190216, 4278190212, 4278190208, 4278190204, 4278190200, 4278190196, 4278190192, 4278190188, 4278190184, 4278190180, 4278190176, 4278190173, 4278190169, 4278190165, 4278190161, 4278190157, 4278190153, 4278190149, 4278190145, 4278190141, 4278190137, 4278190133, 4278190129, 4278190125, 4278190121, 4278190117, 4278190113, 4278190110, 4278190106, 4278190102, 4278190098, 4278190094, 4278190090, 4278190086, 4278190082],
  seismic: [4286578688, 4286578688, 4286709760, 4286840832, 4286971904, 4287168512, 4287299584, 4287430656, 4287496192, 4287627264, 4287758336, 4287889408, 4288086016, 4288217088, 4288348160, 4288413696, 4288544768, 4288675840, 4288806912, 4289003520, 4289134592, 4289265664, 4289331200, 4289462272, 4289593344, 4289724416, 4289921024, 4290052096, 4290183168, 4290314240, 4290445312, 4290510848, 4290641920, 4290772992, 4290969600, 4291100672, 4291231744, 4291362816, 4291428352, 4291559424, 4291690496, 4291887104, 4292018176, 4292149248, 4292280320, 4292345856, 4292476928, 4292608000, 4292804608, 4292935680, 4293066752, 4293197824, 4293263360, 4293394432, 4293525504, 4293656576, 4293853184, 4293984256, 4294115328, 4294180864, 4294311936, 4294443008, 4294574080, 4294770688, 4294836224, 4294902531, 4294903559, 4294904587, 4294905615, 4294906643, 4294907671, 4294908699, 4294909727, 4294910755, 4294911783, 4294912811, 4294913839, 4294914867, 4294915895, 4294916923, 4294917951, 4294918979, 4294920007, 4294921035, 4294922063, 4294923091, 4294924119, 4294925147, 4294926175, 4294927203, 4294928231, 4294929259, 4294930287, 4294931315, 4294932343, 4294933371, 4294934399, 4294935427, 4294936455, 4294937483, 4294938511, 4294939539, 4294940567, 4294941595, 4294942623, 4294943651, 4294944679, 4294945707, 4294946735, 4294947763, 4294948791, 4294949819, 4294950847, 4294951875, 4294952903, 4294953931, 4294954959, 4294955987, 4294957015, 4294958043, 4294959071, 4294960099, 4294961127, 4294962155, 4294963183, 4294964211, 4294965239, 4294966267, 4294901246, 4294704127, 4294440959, 4294177791, 4293914623, 4293651455, 4293388287, 4293125119, 4292861951, 4292598783, 4292335615, 4292072447, 4291809279, 4291546111, 4291282943, 4291019775, 4290756607, 4290493439, 4290230271, 4289967103, 4289703935, 4289440767, 4289177599, 4288914431, 4288651263, 4288388095, 4288124927, 4287861759, 4287598591, 4287335423, 4287072255, 4286809087, 4286545919, 4286282751, 4286019583, 4285756415, 4285493247, 4285230079, 4284966911, 4284703743, 4284440575, 4284177407, 4283914239, 4283651071, 4283387903, 4283124735, 4282861567, 4282598399, 4282335231, 4282072063, 4281808895, 4281545727, 4281282559, 4281019391, 4280756223, 4280493055, 4280229887, 4279966719, 4279703551, 4279440383, 4279177215, 4278914047, 4278650879, 4278387711, 4278190334, 4278190332, 4278190329, 4278190326, 4278190323, 4278190320, 4278190318, 4278190315, 4278190312, 4278190309, 4278190306, 4278190304, 4278190301, 4278190298, 4278190295, 4278190292, 4278190290, 4278190287, 4278190284, 4278190281, 4278190278, 4278190276, 4278190273, 4278190270, 4278190267, 4278190264, 4278190262, 4278190259, 4278190256, 4278190253, 4278190250, 4278190248, 4278190245, 4278190242, 4278190239, 4278190236, 4278190234, 4278190231, 4278190228, 4278190225, 4278190222, 4278190219, 4278190217, 4278190214, 4278190211, 4278190208, 4278190205, 4278190203, 4278190200, 4278190197, 4278190194, 4278190191, 4278190189, 4278190186, 4278190183, 4278190180, 4278190177, 4278190175, 4278190172, 4278190169, 4278190166, 4278190163, 4278190161, 4278190158],
  paired: [4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4289122019, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4280252596, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4289912714, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4281573420, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4294679193, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4293073436, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294819695, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4294934272, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4291474134, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4285152666, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4294967193, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776, 4289812776]
  /* eslint-enable max-len */
}