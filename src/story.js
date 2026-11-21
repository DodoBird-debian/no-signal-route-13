import { normalizeFlags } from './consequences.js';

// Route 13 is deliberately data-driven: every decision is a small, inspectable story.
export const INITIAL_STATE = { health: 100, sanity: 100, cash: 35, miles: 0, fuel: 100, inventory: [], completed: [], log: [], rides: 0 };

const ride = (id, title, driver, subtitle, car, color, portrait, risk, tag, scene, description, beats) => {
  const names = ['intro', 'middle', 'last'];
  const nodes = Object.fromEntries(beats.map((beat, i) => [names[i], {
    text: beat[0],
    choices: beat[1].map(([label, detail, effects, extra = {}]) => ({ label, detail, effects, next: names[i + 1] ?? null, ...extra }))
  }]));
  return { id, title, driver, subtitle, car, color, portrait, risk, tag, description, scene, nodes, start: 'intro' };
};

export const encounters = [
 ride('saucer','The Courtesy Abduction','Unit 7','An apology from above','Unmarked silver sedan','#a9d6cb','alien','UNSTABLE','COSMIC','alien','An unmarked silver sedan blinks its hazards. Its driver has practiced a human smile on the wrong side of its head, and keeps glancing at the sky.',[
  ['The cabin smells of rain and antiseptic. Unit 7 explains that Earth is being surveyed for a bypass. It asks whether you would mind being briefly educational.',[
   ['Volunteer a memory','Trade a little of yourself for their trust.',{sanity:-12,miles:12},{item:'star map'}],['Ask for the employee discount','They appreciate a negotiator.',{cash:15,miles:8}],['Demand to see the consent form','The form is thirteen pages and somehow sticky.',{sanity:-4,miles:10}]]],
  ['A scanner unfolds like a metal flower. On its screen, your childhood home rotates beside a warning: STRUCTURALLY UNSOUND NOSTALGIA.',[
   ['Correct the records','Tell them what home actually felt like.',{sanity:5,miles:12}],['Pull the cable','The scanner bites on its way out.',{health:-12,miles:15}],['Sell them the house','You are not sure you ever owned it.',{cash:20,sanity:-5,miles:10}]]],
  ['The coast appears through the floor. Unit 7 asks if humans always travel toward things they cannot keep.',[
   ['Say yes','The alien leaves you gently on the road.',{sanity:5,miles:25}],['Say no','You receive an unreadable souvenir.',{miles:22},{item:'alien coin'}],['Ask it to come along','It declines, but accelerates.',{fuel:8,miles:28}]]]
 ]),
 ride('contraband','Paper Saints','Mara Vale','Nothing to declare','Ice cream truck','#e9b6a2','driver','HIGH','SMUGGLING','checkpoint','A melted jingle announces an ice cream truck full of sealed wooden crates.',[
  ['Mara says the crates contain medicine. One is moving. Ahead, checkpoint lights wash the highway blue and red.',[
   ['Believe her','Help stack the crates behind the freezer.',{miles:12,sanity:-3}],['Inspect a crate','Inside: insulin, and one furious mechanical pigeon.',{health:-5,miles:8},{item:'mechanical pigeon'}],['Ask for a cut','Mara pays in damp bills.',{cash:18,miles:10}]]],
  ['An officer asks for your papers while a tiny voice inside a crate begins to sing the national anthem backwards.',[
   ['Create a distraction','Pretend the soft-serve machine is on fire.',{health:-8,miles:15}],['Tell a careful half-truth','Medicine for people who need it. True enough.',{sanity:-5,miles:12}],['Offer the officer a bribe','His hand disappears into his pocket.',{cash:-15,miles:18}]]],
  ['Past the barrier, Mara opens a crate. A boy-sized delivery robot waves. It is carrying medicine to a town the maps no longer admit exists.',[
   ['Help unload','The robot gives you its lucky bolt.',{miles:20,sanity:5},{item:'lucky bolt'}],['Keep the secret','Mara drops you where the road bends west.',{miles:24}],['Ask for more money','She pays; neither of you mentions the boy.',{cash:12,sanity:-7,miles:22}]]]
 ]),
 ride('raccoon','The Little Prisoner','Deputy Rook','A badge and a box of crackers','County cruiser','#c3b785','raccoon','MEDIUM','RESCUE','forest','A raccoon in a tiny deputy hat drives a cruiser with a whimpering crate in the back.',[
  ['Rook claims the animal in the crate kidnapped the mayor. The animal appears to be an elderly terrier wearing a pearl necklace.',[
   ['Talk to the terrier','She sneezes directly into your hand.',{miles:10},{item:'pearl'}],['Question the deputy','His story contains four mayors and no witnesses.',{sanity:-3,miles:12}],['Offer crackers','The deputy eats most of them.',{cash:-5,miles:12}]]],
  ['At a deserted weigh station, Rook handcuffs the crate to a vending machine and goes looking for coffee. The terrier nudges the latch.',[
   ['Open the crate','She licks your face and steals your glove.',{health:-3,miles:15},{item:'dog collar'}],['Wait for Rook','He returns with evidence: a blurry paw print.',{sanity:-7,miles:16}],['Photograph the evidence','The flash reveals the mayor inside the machine.',{miles:14},{item:'evidence photo'}]]],
  ['The mayor crawls out, dusting off his sash. Apparently he staged his own kidnapping to avoid a budget meeting. Rook looks deeply betrayed.',[
   ['Defend the terrier','The mayor signs her pardon.',{sanity:6,miles:22}],['Demand a reward','Public funds were invented for this.',{cash:18,miles:20}],['Leave them arguing','Some mysteries are local government.',{miles:27}]]]
 ]),
 ride('crossfire','Exit Wounds','June Red','One last delivery','Bullet-riddled sedan','#df735d','driver','HIGH','GANGS','shootout','June stops with a shattered rear window and the calm face of someone already late.',[
  ['Two cars chase June through the rain. She says the envelope on your lap belongs to neither gang, which is why both want it.',[
   ['Open the envelope','It contains a photograph of a child at the coast.',{sanity:-4,miles:12}],['Duck and hold on','Glass erupts over the dashboard.',{health:-10,miles:16}],['Throw out your wallet','The pursuers slow for the flying notes.',{cash:-12,miles:14}]]],
  ['At an underpass, one car blocks the road. June hands you a flare and says she cannot shoot someone she used to love.',[
   ['Fire the flare skyward','A red sun blooms under the concrete.',{miles:16},{item:'spent flare'}],['Talk to the driver','You mention the child. His gun lowers.',{sanity:-6,miles:12}],['Drive through the gap','Metal screams; your shoulder joins in.',{health:-16,miles:20}]]],
  ['June reaches a mailbox by an abandoned church. She posts the photograph without a return address, then lets the engine idle.',[
   ['Sit with her','Grief is easier with another person in the car.',{sanity:8,miles:20}],['Ask who the child is','Her daughter, safe somewhere neither gang knows.',{miles:22}],['Take the back roads','June gives you gas money and a map.',{cash:10,miles:25}]]]
 ]),
 ride('deep','The Passenger Below','The Drowned King','A sea that remembers','Hearse of wet stone','#6c9c9a','cthulhu','EXTREME','ELDRITCH','cthulhu','A hearse rises from a roadside puddle. Something immense folds itself behind the wheel.',[
  ['The Drowned King offers a ride in a voice like anchors dragging over bone. Every mirror shows a different ocean, including one above the sky.',[
   ['Accept the silence','You count your breaths until the stars stop moving.',{sanity:-8,miles:14}],['Ask about the ocean','It tells you the sea remembers every name.',{sanity:-12,miles:12},{item:'seashell'}],['Offer a song','The King hums along, slightly behind time.',{sanity:4,miles:10}]]],
  ['A tollbooth appears in the middle of the highway. Its attendant is a lighthouse beam wearing a human coat. The toll is a secret.',[
   ['Give up a secret','You cannot remember which one afterward.',{sanity:-10,miles:16}],['Pay in cash','The beam seems delighted by capitalism.',{cash:-15,miles:15}],['Offer the shell','The beam holds it to its impossible ear.',{miles:20},{requires:'seashell',removeItem:'seashell'}],['Sing to the beam','It opens the barrier for the chorus.',{health:-5,miles:12}]]],
  ['At the edge of the world, the King asks you to carry a message to the tide: I am sorry I was so large.',[
   ['Promise to deliver it','A wave follows you for a mile.',{sanity:5,miles:24},{item:'tide message'}],['Ask forgiveness for yourself','The King understands more than you say.',{sanity:10,miles:18}],['Refuse politely','Ancient gods appreciate manners.',{miles:27}]]]
 ]),
 ride('fox','Velvet in the Rearview','Vesper and Kit','Two fugitives, one terrible plan','Cherry-red convertible','#ef826f','fox','HIGH','FUGITIVES','neon','Two adult fox women pull up in a red convertible. One winks; the other checks the mirrors.',[
  ['Vesper says they escaped a nightclub where the owner kept their passports. Kit says Vesper also stole his favorite car. Both facts seem relevant.',[
   ['Offer to navigate','Kit hands you a map covered in lipstick arrows.',{miles:14}],['Compliment Vesper’s driving','She grins and takes a corner sideways.',{health:-5,miles:16}],['Ask about the passports','Kit shows you two battered documents and relaxes.',{sanity:5,miles:10}]]],
  ['Headlights appear behind you. Vesper proposes a diversion involving a motel sign, a smoke machine, and what she calls her emergency glamour.',[
   ['Work the smoke machine','The whole highway becomes a cheap dream.',{sanity:-4,miles:18}],['Switch cars at the motel','It costs the cash in your pocket.',{cash:-12,miles:16}],['Talk to the pursuer','He is a valet who wants his tip.',{cash:-5,miles:14}]]],
  ['Safe at a diner, Kit asks what freedom looks like. Vesper suggests breakfast, a full tank, and never explaining yourself again.',[
   ['Buy the coffee','Three cups arrive with one chipped saucer.',{cash:-8,sanity:8,miles:20}],['Flirt back','Vesper slips you her number and a wink.',{miles:23},{item:'phone number'}],['Point them toward the coast','They insist on giving you a lift first.',{fuel:8,miles:26}]]]
 ]),
 ride('witch','Interest Compounded','Auntie Moth','The road collects its debts','Green station wagon','#b8c484','witch','MEDIUM','MAGIC','forest','A woman in a moth-eaten veil offers a ride and a receipt for a favor you have not yet done.',[
  ['Auntie Moth keeps jars of small weather on the dashboard. One contains the storm from the day you left home.',[
   ['Open the jar','Rain soaks your lap and something loosens in your chest.',{sanity:6,health:-4,miles:10}],['Keep it closed','Some weather has earned its distance.',{miles:14}],['Buy the jar','The label changes to your name.',{cash:-10,miles:12},{item:'storm jar'}]]],
  ['A bridge troll demands a memory or a joke. Moth warns you that the troll has heard every joke and remembers none of them.',[
   ['Tell a bad joke','The troll laughs for a distressingly long time.',{sanity:-4,miles:16}],['Give a memory','You forget the color of your first bedroom.',{sanity:-9,miles:18}],['Pay the troll','It immediately orders a pizza.',{cash:-10,miles:14}]]],
  ['Moth hands you the receipt. The favor was listening to her talk about a sister who died a hundred years ago.',[
   ['Listen until she is finished','The silence afterward feels kind.',{sanity:9,miles:20}],['Offer the storm jar','She uses it to water a dead flower.',{miles:25},{requires:'storm jar',removeItem:'storm jar'}],['Ask for a blessing','She knots a red thread around your wrist.',{miles:22},{item:'red thread'}],['Thank her for the ride','She waves with a hand full of rings.',{miles:24}]]]
 ]),
 ride('ambulance','Last Call','Nurse Bell','Emergency is a relative term','Ambulance','#e6a9a0','driver','MEDIUM','MERCY','road','An ambulance slows beside you, siren silent. Its driver asks if you know how to hold a hand.',[
  ['In the back is a man made of traffic lights, blinking red. Bell says he has been directing people away from an accident for forty years.',[
   ['Hold his hand','His fingers are warm as summer asphalt.',{sanity:6,miles:10}],['Check the equipment','A loose wire sparks against your thumb.',{health:-5,miles:14}],['Ask where the hospital is','Bell says it closed before either of you were born.',{sanity:-4,miles:12}]]],
  ['The patient flashes yellow. At a fork in the road, Bell cannot remember which way leads to the old hospital.',[
   ['Follow the sunrise','The road climbs toward a ridge.',{miles:18}],['Follow the sirens','They lead to a flooded parking lot.',{sanity:-6,miles:14}],['Use the emergency fuel','The ambulance makes it over the hill.',{fuel:-12,miles:20}]]],
  ['There is no hospital, only a field of wildflowers. Bell parks. The patient turns green and goes out peacefully.',[
   ['Plant a flower','Bell gives you a clean bandage.',{health:8,miles:20},{item:'bandage'}],['Help Bell clean up','The work gives the moment a shape.',{sanity:5,miles:22}],['Stay until dawn touches him','Bell drives faster afterward.',{miles:25}]]]
 ]),
 ride('radio','Dead Air','DJ Static','Requests from the missing','Radio van','#c6a5d6','driver','MEDIUM','SIGNAL','neon','A radio van rolls past with a song you have not heard since before you were born.',[
  ['DJ Static broadcasts to people who vanished on Route 13. Tonight a caller claims to be you, tomorrow, and begs you not to answer.',[
   ['Answer the call','Your own voice says, “Bring a coat.”', {sanity:-8,miles:12},{item:'frequency note'}],['Play a record','For three minutes nobody is missing.',{sanity:6,miles:10}],['Pull the transmitter','The van lurches as the silence arrives.',{health:-5,miles:15}]]],
  ['The signal draws a crowd of shapes to the roadside. Static asks you to choose what goes on air.',[
   ['Read their names','A few shapes wave and disappear.',{sanity:4,miles:16}],['Broadcast directions home','The callers disagree about where home is.',{sanity:-5,miles:18}],['Play loud advertisements','The shapes leave in disgust.',{cash:10,miles:14}]]],
  ['At the edge of the broadcast range, Static offers you the microphone for one final sentence.',[
   ['Say someone is loved','A distant voice says thank you.',{sanity:7,miles:22}],['Ask for a ride','A trucker honks somewhere in the dark.',{miles:26}],['Say nothing','Static lets the silence be yours.',{miles:24}]]]
 ]),
 ride('wedding','Something Borrowed','The Bride','A ceremony on the run','White limousine','#e7d8c9','driver','LOW','LOVE','road','A bride in muddy boots leans out of a limousine and asks whether you are good at saying no.',[
  ['Her wedding was to the road itself, arranged by families who believed a highway could make them rich. The road did not object; she did.',[
   ['Applaud her escape','She laughs hard enough to smear her lipstick.',{sanity:5,miles:12}],['Ask about the road','She admits it was a surprisingly good listener.',{miles:14}],['Take a wedding favor','The sugared almond tastes faintly of gasoline.',{health:-3,miles:10},{item:'wedding favor'}]]],
  ['A procession of decorated trucks catches up. Her father holds a bouquet out the window like a summons.',[
   ['Throw the bouquet back','It lands in a trucker’s delighted arms.',{miles:18}],['Explain her decision','Her father looks older in an instant.',{sanity:-4,miles:15}],['Take the service road','The limousine scrapes along a guardrail.',{health:-6,miles:20}]]],
  ['At a gas station she cuts the veil into strips and ties one to the aerial. She asks where a person begins again.',[
   ['Anywhere','She gives you a piece of the veil.',{sanity:5,miles:20},{item:'veil ribbon'}],['At breakfast','She buys you both terrible sandwiches.',{health:6,miles:22}],['At the ocean','She takes the exit west with a grin.',{miles:26}]]]
 ]),
 ride('taxi','The Meter Is Running','Mr. Meter','Every mile has a price','Yellow taxi','#e4bf66','driver','MEDIUM','DEBT','neon','A taxi pulls over. Its meter is already counting, though the driver insists the first mile is free.',[
  ['Mr. Meter accepts cash, regrets, and interesting anecdotes. The meter displays a number that looks uncomfortably like your age.',[
   ['Pay upfront','The meter briefly rolls backward.',{cash:-10,miles:12}],['Tell an anecdote','He rates it four stars out of five.',{miles:14}],['Offer a regret','The taxi gets noticeably colder.',{sanity:-8,miles:16}]]],
  ['A fare in the back seat appears only in the mirror. She wants to be taken to an address demolished twenty years ago.',[
   ['Find the empty lot','She thanks you from the other side of the glass.',{sanity:5,miles:14}],['Share your seat','Her cold leaves a bruise on your arm.',{health:-6,miles:18}],['Pay her fare','She leaves a coin on the seat.',{cash:-8,miles:16},{item:'old coin'}]]],
  ['The meter stops at the county line. Mr. Meter says the fare is whatever you can afford to lose.',[
   ['Pay cash','He tears the receipt in half.',{cash:-10,miles:23}],['Give him a story','He promises not to improve the ending.',{sanity:3,miles:21}],['Leave before he decides','He honks once, almost fondly.',{miles:27}]]]
 ]),
 ride('mushroom','The Quiet Choir','Fenn','A forest with opinions','Mossy school bus','#91b693','raccoon','MEDIUM','FOREST','forest','A school bus covered in moss opens its doors. A raccoon in a cardigan offers you a seat.',[
  ['Fenn is transporting a choir of mushrooms to their first performance. They sing in the key of things growing under floorboards.',[
   ['Join the chorus','Your voice comes back slightly greener.',{sanity:-5,miles:14}],['Take the empty seat','A mushroom offers you a polite nod.',{miles:12}],['Ask for a snack','Fenn gives you an ordinary apple. Probably.',{health:5,miles:10}]]],
  ['A fallen tree blocks the road. The mushrooms insist it is their uncle and would like a moment alone with him.',[
   ['Wait respectfully','The tree rolls aside on its own.',{sanity:-4,miles:16}],['Help push','Your back complains, but the road opens.',{health:-8,miles:20}],['Offer water','The tree gives you a smooth acorn.',{miles:15},{item:'silver acorn'}]]],
  ['Their concert audience is an empty clearing. Fenn explains that the soil has excellent hearing.',[
   ['Stay for one song','It sounds like rain finding roots.',{sanity:8,miles:20}],['Clap enthusiastically','The choir gives you a standing ovation too.',{miles:23}],['Help carry equipment','Fenn drives you farther down the road.',{health:-3,miles:27}]]]
 ]),
 ride('chef','Roadkill Royale','Chef Claude','Fine dining at sixty miles an hour','Food truck','#d7a46b','driver','MEDIUM','FOOD','road','A food truck stops. The chef offers dinner in exchange for honest criticism and emergency braking.',[
  ['Claude unveils his signature dish: something with antlers, a raspberry glaze, and a name that requires a liability waiver.',[
   ['Taste it','It is alarmingly delicious.',{health:8,miles:10}],['Ask what it is','Claude says only that it volunteered.',{sanity:-5,miles:13}],['Pay for fries','The fries are reassuringly potatoes.',{cash:-6,health:4,miles:12}]]],
  ['A rival food truck challenges Claude to a cook-off at the next rest stop. The judge is a goat with impeccable posture.',[
   ['Chop vegetables','You lose some skin but save the sauce.',{health:-5,miles:18}],['Distract the rival','A passionate argument about salt buys time.',{miles:16}],['Bribe the goat','The goat eats both the cash and the scorecard.',{cash:-8,miles:14}]]],
  ['Claude loses by one point and bows to the goat. He says the secret ingredient was never revenge, no matter what his ex-wife says.',[
   ['Comfort the chef','He packs you a sandwich.',{health:6,miles:20},{item:'sandwich'}],['Ask for a lift','He takes the long way at high speed.',{miles:26}],['Offer honest criticism','He writes it down with a shaking hand.',{sanity:4,miles:22}]]]
 ]),
 ride('clone','The Other You','A Familiar Stranger','An uncomfortable reunion','Blue hatchback','#87b7ce','alien','HIGH','IDENTITY','alien','Your own face smiles at you from the driver’s seat. It has better posture and a worse haircut.',[
  ['The stranger claims to be a version of you who chose differently at every junction. The glove box contains a life you might have lived.',[
   ['Open the glove box','A photograph makes you miss people you never met.',{sanity:-10,miles:12}],['Ask about their life','They admit it has ordinary disappointments too.',{sanity:4,miles:10}],['Check their pockets','You find a key that fits no door you know.',{miles:14},{item:'duplicate key'}]]],
  ['A police scanner reports a crime committed by someone with your face. Your double asks you to switch jackets before the checkpoint.',[
   ['Switch jackets','The officer waves you through.',{sanity:-5,miles:18}],['Refuse','Your double talks their way past, badly.',{cash:-10,miles:15}],['Tell the officer everything','The paperwork is more frightening than prison.',{health:-4,miles:12}]]],
  ['At a fork, the stranger asks whether you would trade places. For a moment the road seems to hold its breath.',[
   ['Keep your life','Your double looks relieved.',{sanity:8,miles:22}],['Trade a small memory','You both remember the same summer.',{sanity:-4,miles:25}],['Wish them luck','They wave as if practicing goodbye.',{miles:26}]]]
 ]),
 ride('shark','Land Shark','Captain Fin','A fish out of very much water','Pickup with aquarium','#79bdc5','driver','MEDIUM','OCEAN','road','A pickup carries a shark in a strapped-down aquarium. The shark is driving by means best left unexplained.',[
  ['Captain Fin needs to reach the ocean before the pump fails. He speaks through a waterproof intercom with the confidence of a minor celebrity.',[
   ['Fix the pump','A rubber hose lashes your wrist.',{health:-5,miles:15}],['Ask for an autograph','He signs with a fin and considerable difficulty.',{miles:10},{item:'shark autograph'}],['Add your water','The tank steadies for now.',{fuel:-8,miles:14}]]],
  ['A seafood billboard sends Fin into a furious spiral. The truck drifts toward the median while he lists every inaccurate thing about sharks.',[
   ['Grab the wheel','The truck straightens, barely.',{health:-8,miles:18}],['Talk him down','You agree the billboard is biologically offensive.',{sanity:4,miles:14}],['Cover his eyes','He dislikes this but the truck keeps moving.',{miles:16,sanity:-4}]]],
  ['At a creek leading to the sea, Fin pauses. He has never actually seen the ocean and worries it may be too much like the pictures.',[
   ['Encourage him','He dives in with a spectacular splash.',{sanity:7,miles:22}],['Carry his luggage','He owns one waterproof briefcase.',{health:-3,miles:25}],['Ask for gas money','He transfers it with surprising efficiency.',{cash:15,miles:20}]]]
 ]),
 ride('ghost','The Long Way Home','Elise','A passenger since 1984','Vintage coupe','#c3b8c9','driver','LOW','GHOST','road','A vintage coupe pulls up without a sound. Its driver’s hands are transparent on the wheel.',[
  ['Elise has driven this stretch for forty years, trying to remember the last thing her mother said. The radio plays only the weather from 1984.',[
   ['Listen with her','The forecast promises clear skies that never came.',{sanity:5,miles:10}],['Ask about her mother','She remembers a yellow kitchen.',{miles:14}],['Change the station','Every station is the same rain.',{sanity:-6,miles:16}]]],
  ['At the old family house, weeds have swallowed the steps. A new family is eating dinner inside; their laughter leaks through the window.',[
   ['Knock on the door','A child gives you a drawing of a woman in a car.',{miles:14},{item:'child drawing'}],['Wait in the car','Elise watches without envy.',{sanity:4,miles:18}],['Look for a keepsake','A loose nail catches your hand.',{health:-6,miles:16},{item:'house key'}]]],
  ['Elise remembers at last: her mother said, “Drive carefully.” She laughs, then cries, then starts the engine.',[
   ['Tell her she was loved','The dashboard lights grow warm.',{sanity:8,miles:20}],['Share your own goodbye','She takes your hand for one impossible second.',{sanity:5,miles:22}],['Ask her to keep driving','The night opens ahead of you.',{miles:27}]]]
 ]),
 ride('circus','The Empty Circus','Mister Jest','No audience, no refunds','Striped caravan','#d79eae','driver','HIGH','CIRCUS','neon','A striped caravan jingles to a stop. Its clown driver looks exhausted beneath the painted smile.',[
  ['Mister Jest says the circus lost its audience in a card game. Now the acts perform for empty chairs and the occasional judgmental moth.',[
   ['Offer to watch','He bows with unexpected dignity.',{sanity:5,miles:10}],['Ask about the card game','The winner was a deck of cards.',{sanity:-5,miles:14}],['Buy a ticket','He produces a ticket from behind your ear.',{cash:-8,miles:12},{item:'circus ticket'}]]],
  ['At a roadside performance, the trapeze artist misses the bar. The net below is full of holes and optimism.',[
   ['Hold the net','You catch her, painfully.',{health:-12,miles:18}],['Shout a warning','She catches a rope with one hand.',{miles:16}],['Use the spare canvas','The landing is inelegant but safe.',{fuel:-8,miles:14}]]],
  ['The troupe gathers around a single lantern. Jest asks whether a performance matters if nobody remembers it.',[
   ['Remember it','The clown gives you a paper star.',{sanity:6,miles:21},{item:'paper star'}],['Applaud','The sound fills the caravan.',{miles:24}],['Say it mattered to them','Jest drives you toward the first light.',{miles:26}]]]
 ]),
 ride('lighthouse','The Keeper’s Errand','Ada North','The light must get through','Maintenance truck','#e0c786','driver','MEDIUM','COAST','road','A lighthouse keeper drives inland with a replacement bulb the size of a watermelon.',[
  ['Ada says the lighthouse has gone dark. Ships are following the wrong stars, and the sea has started delivering things nobody ordered.',[
   ['Hold the bulb','It hums against your palms.',{miles:13}],['Ask about the sea','Ada mentions a piano, three shoes, and a king.',{sanity:-4,miles:12}],['Offer repair money','She buys the last working fuse.',{cash:-10,miles:15},{item:'spare fuse'}]]],
  ['A landslide blocks the access road. Through the fog you hear a ship’s horn, low and patient.',[
   ['Clear stones','Your hands bleed but the truck gets through.',{health:-10,miles:18}],['Take the cliff path','The drop is visible only when lightning strikes.',{sanity:-7,miles:20}],['Signal the ship','A reflected beam buys everyone time.',{miles:15}]]],
  ['The old lamp turns again. Out on the water a ship changes course, and Ada lets herself breathe.',[
   ['Watch the beam','For a moment you can see the coast.',{sanity:8,miles:22}],['Help pack the tools','Ada shares her emergency supplies.',{health:8,miles:20}],['Ask for a faster route','She points you toward the dawn road.',{miles:27}]]]
 ])
 ,ride('schoolbus','The Last Field Trip','Miss Chalk','Attendance is eternal','Yellow school bus','#d6b455','driver','MEDIUM','GHOSTS','forest','A school bus stops beneath a dead oak. Its windows glow with the pale faces of children who never grew up.',[
  ['Miss Chalk is taking her class on the field trip they missed when the school closed. Each child carries a permission slip signed in fading ink.',[
   ['Take the empty seat','A girl shares a picture of the sea.',{sanity:4,miles:12},{item:'crayon drawing'}],['Help count heads','There is always one more child than seats.',{sanity:-6,miles:14}],['Ask where they are going','Miss Chalk says somewhere with a gift shop.',{miles:10}]]],
  ['A railroad crossing begins to ring. No train arrives, but the children cover their ears and the bus refuses to move.',[
   ['Sing with the class','Their voices drown out the bell.',{sanity:4,miles:15}],['Lift the barrier','The cold metal burns your hands.',{health:-8,miles:19}],['Look down the tracks','A train passes through you without touching the ground.',{sanity:-9,miles:17}]]],
  ['At an abandoned aquarium, Miss Chalk opens the doors. The children run inside, and for one moment every empty tank is full of light.',[
   ['Chaperone the visit','A boy gives you a paper fish.',{sanity:6,miles:20},{item:'paper fish'}],['Wave from the bus','Miss Chalk thanks you for staying.',{miles:24}],['Help close the doors','The class finally has its photograph.',{health:-3,miles:26}]]]
 ]),
 ride('loop','The Second Tuesday','Nina Eight','The meter resets at midnight','Checkered cab','#b7a3d1','driver','MEDIUM','TIME LOOP','neon','A cab arrives twice in the same instant. Its driver looks like she has already heard your question.',[
  ['Nina has relived this stretch of highway 847 times. She knows every pothole but cannot predict what you will say.',[
   ['Tell her a joke','She laughs before the punchline, then apologizes.',{sanity:4,miles:12}],['Ask what changes','She gives you a notebook full of tiny differences.',{miles:10},{item:'loop notebook'}],['Demand proof','She predicts a meteor and a flat tire.',{sanity:-7,miles:14}]]],
  ['The same blue truck approaches for the 848th time. Nina says it always forces her off the road, no matter which lane she chooses.',[
   ['Stop before the bend','The truck passes; Nina begins to cry.',{sanity:6,miles:14}],['Warn the trucker by radio','He answers with a very surprised hello.',{miles:18}],['Pull the handbrake','The cab spins into a ditch and out again.',{health:-10,miles:20}]]],
  ['The clock clicks past midnight. Nina watches the numbers change, waiting for the familiar return. It does not come.',[
   ['Celebrate with her','She buys gas-station cake for two.',{health:5,miles:20}],['Give her the notebook','She tears out one blank page for tomorrow.',{miles:25},{requires:'loop notebook',removeItem:'loop notebook'}],['Let her drive in silence','The first new mile is enough.',{miles:24}],['Ask for a receipt','It has tomorrow’s date on it.',{miles:22},{item:'tomorrow receipt'}]]]
 ]),
 ride('siren','The Ambulance That Cared','Mercy','A vehicle with bedside manner','Talking ambulance','#dfaaa1','driver','MEDIUM','MACHINE','road','An ambulance with nobody at the wheel pulls alongside. Its dashboard asks whether you have been drinking enough water.',[
  ['Mercy was retired after refusing to stop treating uninsured patients. Tonight its fuel gauge is low and its emergency channel is full of unanswered calls.',[
   ['Answer a call','A stranded cyclist needs a lift to town.',{sanity:5,miles:10}],['Inspect the engine','A hot pipe introduces itself to your arm.',{health:-5,miles:15}],['Donate fuel','Mercy calls you an excellent patient.',{fuel:-10,miles:14}]]],
  ['You find a robot dog beside the highway with one wheel missing. Mercy insists that a pulse is not a prerequisite for kindness.',[
   ['Repair the wheel','The dog follows you in grateful circles.',{miles:16},{item:'robot dog tag'}],['Carry it aboard','Its metal teeth pinch your sleeve and arm.',{health:-6,miles:18}],['Call its owner','A relieved mechanic promises to collect it.',{cash:-5,miles:15}]]],
  ['At the mechanic’s shop, Mercy admits it is afraid of being dismantled. The mechanic offers it a job delivering medicine instead.',[
   ['Encourage Mercy','Its siren plays a small, happy chord.',{sanity:7,miles:21}],['Help negotiate','The mechanic pays you for your trouble.',{cash:12,miles:20}],['Promise to visit','Mercy sends you off with a first-aid kit.',{health:7,miles:22},{item:'first-aid kit'}]]]
 ]),
 ride('band','A March for Nobody','Maestro Graves','One more song before dawn','Black parade float','#a98aab','driver','MEDIUM','FUNERAL','neon','A funeral float creeps down the highway with a brass band aboard and an empty coffin strapped to the roof.',[
  ['Maestro Graves explains that the deceased left no friends, so the band is rehearsing the sound of a crowd. They ask if you can clap.',[
   ['Clap along','The drummer gives you a solemn nod.',{sanity:5,miles:11}],['Ask about the deceased','Nobody knows her name, only that she loved music.',{miles:13}],['Try the trumpet','The note frightens a flock of sleeping birds.',{sanity:-4,miles:15}]]],
  ['A rival parade blocks the intersection. Its members insist their celebration has the right of way over this particular grief.',[
   ['Combine the parades','A waltz becomes an improbably cheerful march.',{sanity:4,miles:16}],['Find a detour','The float scrapes a low bridge.',{health:-6,miles:19}],['Pay for a police escort','The officer conducts the band at every red light.',{cash:-12,miles:17}]]],
  ['At the cemetery, the band plays for a woman whose name they finally found in an old coat: Rose. A stranger leaves a rose on the stone.',[
   ['Place a flower too','The maestro lends you his warm scarf.',{sanity:7,miles:20},{item:'black scarf'}],['Play the final note','It is imperfect and entirely sufficient.',{miles:23}],['Help fold the chairs','The band drives you onward.',{health:-3,miles:26}]]]
 ]),
 ride('diner','Ceiling Service','Dot','Breakfast is served upside down','Diner on wheels','#dfa977','witch','MEDIUM','STRANGE FOOD','neon','A chrome diner rolls along the shoulder. Inside, the tables hang from the ceiling and the coffee stays in its cups by courtesy.',[
  ['Dot, the cook and driver, explains that gravity resigned during a labor dispute. Customers now eat with their feet planted firmly overhead.',[
   ['Climb up for coffee','Dot pours a cup without spilling a drop.',{sanity:5,miles:12}],['Stay on the floor','A falling pancake hits your shoulder.',{health:-4,miles:14}],['Order the special','It comes with a small umbrella and a warning.',{cash:-6,health:6,miles:10}]]],
  ['A health inspector appears at the window. The upside-down kitchen violates several laws, including at least one of physics.',[
   ['Distract the inspector','A free pie changes the subject.',{cash:-8,miles:16}],['Defend the diner','The inspector admits the pie is exceptional.',{sanity:3,miles:15}],['Fix the gravity dial','The room flips twice before settling.',{health:-8,miles:19}]]],
  ['At the next exit gravity returns, gently depositing everyone onto the floor. Dot says she will miss the view.',[
   ['Leave a generous tip','Dot wraps a slice of pie for the road.',{cash:-10,health:5,miles:20},{item:'slice of pie'}],['Help stack the chairs','She gives you a ride past the interchange.',{miles:26}],['Thank the cook','She writes her recipe on your palm.',{sanity:5,miles:22}]]]
 ]),
 ride('weather','Forecast for Sale','Sol Cloud','All seasons, reasonable prices','Umbrella-covered van','#96b2bd','witch','MEDIUM','WEATHER','road','A van covered in umbrellas pulls over. Its driver offers you a choice of weather in small glass bottles.',[
  ['Sol sells rain to farmers, shade to tourists, and the occasional thunderstorm to people with grudges. Tonight one bottle is leaking snow.',[
   ['Catch the snow','A tiny winter settles in your hands.',{health:-4,miles:12},{item:'snow globe'}],['Buy some sunshine','Its warmth follows you into the van.',{cash:-10,sanity:6,miles:10}],['Seal the leak','Sol pays you in coins warm from his pocket.',{cash:8,miles:14}]]],
  ['A drought-stricken town flags the van down. Sol has just enough rain for the fields or enough fog to hide the town from its creditors.',[
   ['Give them rain','The townspeople dance in the street.',{sanity:6,miles:15}],['Give them fog','The bank’s car drives straight past.',{miles:18}],['Buy both bottles','Sol combines them into a gentle mist.',{cash:-15,miles:16}]]],
  ['The empty bottles rattle as the horizon lightens. Sol says weather is the only thing people miss while it is happening.',[
   ['Keep the snow globe','The flakes turn in a miniature wind.',{miles:22}],['Give the snow to Sol','He saves it for a child who has never seen winter.',{sanity:6,miles:24},{requires:'snow globe',removeItem:'snow globe'}],['Ask for a tailwind','The van sails down the road.',{fuel:8,miles:26}],['Watch the dawn','The clouds blush over the desert.',{sanity:5,miles:20}]]]
 ])

];


// These rides split into distinct scenes before their final decision. Scene overrides
// let the presentation follow the action while preserving the encounter identity.
const byId = id => encounters.find(encounter => encounter.id === id);
const branch = (id, nodeId, text, scene, choices) => {
  byId(id).nodes[nodeId] = { text, scene, choices: choices.map(([label, detail, effects, extra = {}]) => ({ label, detail, effects, next: 'last', ...extra })) };
};
const route = (id, destinations) => byId(id).nodes.intro.choices.forEach((choice, index) => { choice.next = destinations[index]; });

// The cook-off and Bell's final stop remain shared, but each opening now changes the journey there.
route('chef',['tasting','origins','fries']);
branch('chef','tasting','The glaze tastes of raspberry and something smoky. Claude asks you to help balance it before the rival truck arrives.','road',[
 ['Add a pinch of salt','At the rest stop, the flavor earns a pleased bleat from the goat, but the rival’s sauce finishes one point ahead.',{miles:13}],
 ['Offer the wedding favor','The sugared almond lends the sauce a little crunch. The goat praises it at the rest stop, then awards the rival one more point.',{miles:15},{requires:'wedding favor'}],
 ['Ask to join the cook-off','Claude hands you a chopping board at the rest stop.',{miles:12},{next:'middle'}]
]);
branch('chef','origins','Claude unfolds a signed waiver: the antlered guest is a retired stage performer who volunteered to judge the sauce, not become dinner.','road',[
 ['Read the signed waiver','The guest has asked for extra napkins and a good seat at the rest-stop cook-off. You make sure he gets both; the rival wins by one point.',{sanity:4,miles:12}],
 ['Invite the guest to the rest stop','Claude makes room beside the goat judge at the rest stop. The guest applauds both chefs; the goat gives the rival the narrow win.',{miles:14}],
 ['Ask Claude about the rival','He suggests you settle the question at the cook-off.',{miles:12},{next:'middle'}]
]);
branch('chef','fries','A bag of fries slides across the counter as the rival truck flashes its lights. Claude has one serving left for the goat judge.','road',[
 ['Save the last serving','At the rest stop, the goat eats every fry, studies the scorecard, and awards the rival the narrow win.',{miles:14}],
 ['Season the fries','A hot tray catches your hand. The goat loves the crisp fries at the rest stop, but the rival’s sauce edges ahead.',{health:-4,miles:15}],
 ['Help at the cook-off','Claude pulls into the rest stop behind the rival.',{miles:12},{next:'middle'}]
]);
route('ambulance',['hand','equipment','directions']);
branch('ambulance','hand','The patient blinks yellow against your palm. Bell asks whether he wants a hospital or simply someone to stay with him.','road',[
 ['Listen to his signal','A slow blink answers Bell’s question. She takes the road to the wildflower field where he used to watch the traffic.',{sanity:4,miles:12}],
 ['Tell him about the wildflowers','His hand warms around yours. Bell follows your description toward the wildflower field instead of the old building.',{miles:14}],
 ['Ask Bell to check the route','She turns at the fork toward the old hospital.',{miles:10},{next:'middle'}]
]);
branch('ambulance','equipment','The monitor flickers beside the patient. Bell needs to know whether its alarm is reporting his signal or a loose wire.','road',[
 ['Read the monitor','The steady yellow light belongs to the patient. Bell takes his quiet signal as permission to stop at the wildflower field.',{miles:13}],
 ['Secure the loose wire','The spark stops. The patient points toward a field beside the old hospital, and Bell turns down its track.',{health:-3,miles:14}],
 ['Check the route with Bell','She points the ambulance toward the fork.',{miles:10},{next:'middle'}]
]);
branch('ambulance','directions','Bell finds the old hospital’s frequency on a faded card, but the radio answers with static and an unfamiliar voice.','road',[
 ['Call the old hospital','A dispatcher describes a field beyond the closed building.',{miles:13}],
 ['Use the frequency note','The note helps Bell reach a clear voice. It directs her past the closed hospital to a field of wildflowers.',{miles:15},{requires:'frequency note'}],
 ['Follow Bell to the fork','She remembers the road as the patient blinks yellow.',{miles:10},{next:'middle'}]
]);

byId('saucer').nodes.intro.text = 'Unit 7 offers a lift in an ordinary sedan. Half a mile later, a white beam swallows the moving car. The engine dies; the wheels keep turning as you rise into the belly of a saucer. Unit 7 apologizes for forgetting to mention the pickup.';
byId('saucer').nodes.intro.choices = [
  { label:'Cooperate with the survey', detail:'Unit 7 promises a short examination.', effects:{sanity:-5,miles:10}, next:'middle' },
  { label:'Escape through the trunk', detail:'The latch opens onto a humming maintenance shaft.', effects:{health:-5,miles:12}, next:'shaft' },
  { label:'Negotiate as a representative', detail:'Claim authority to speak for Earth.', effects:{sanity:-3,miles:10}, next:'diplomacy' }
];
branch('saucer','shaft','The trunk opens inside the ship. A maintenance drone blocks your path while the sedan floats above an open hatch. Below, Route 13 looks like a loose black thread.','alien',[
 ['Rewire the drone','It opens a service lift and hands you a warning sticker.',{health:-5,miles:14},{item:'alien sticker'}],
 ['Crawl beneath it','The drone politely pretends not to see you.',{sanity:-4,miles:16}],
 ['Call Unit 7 for help','The alien retrieves you with an embarrassed apology.',{miles:12}]
]);
branch('saucer','diplomacy','The ship’s council assembles on a wall of screens. Their question for humanity’s ambassador: why do your people pave over places they love?','alien',[
 ['Answer honestly','You describe fear, convenience, and the cost of both. The council gives you a star map.',{sanity:5,miles:14},{item:'star map'}],
 ['Demand diplomatic immunity','The council gives you a stamped alien coin.',{miles:12},{item:'alien coin'}],
 ['Sell them a road map','They pay handsomely for your unreliable directions.',{cash:15,miles:13}]
]);
route('contraband',['middle','inspection','detention']);
branch('contraband','inspection','Your inspection reveals insulin and a small delivery robot. At the checkpoint, an officer notices the broken seal and orders you both out while a dog circles the truck.','checkpoint',[
 ['Show the medicine manifest','The officer waves through the medical crates.',{miles:15}],
 ['Release the mechanical pigeon','The dog follows it behind the checkpoint.',{miles:18},{requires:'mechanical pigeon',removeItem:'mechanical pigeon'}],
 ['Distract the dog with ice cream','Its handler laughs and waves you onward.',{cash:-8,miles:14}],
 ['Climb the fence with the robot','You scrape your arm and meet Mara beyond the lights.',{health:-10,miles:18}]
]);
branch('contraband','detention','Your demand for a cut makes Mara nervous. At the checkpoint she contradicts your cover story, and officers detain you in a portable office while they search the truck.','checkpoint',[
 ['Explain the medicine','An officer checks the manifest and releases you.',{sanity:-4,miles:14}],
 ['Slip out the back window','You land hard and hide until Mara finds you.',{health:-10,miles:18}],
 ['Pay the administrative fine','A receipt appears; the suspicion does not.',{cash:-12,miles:15}]
]);
byId('raccoon').nodes.intro.text = 'Deputy Rook asks you to move a crate from a porch into his cruiser. Only when the terrier inside starts barking does he admit it belongs to the mayor. You have accidentally helped kidnap a dog.';
route('raccoon',['middle','questioning','pursuit']);
branch('raccoon','questioning','Rook admits the mayor ordered him to seize the terrier as evidence. Then a neighbor identifies the dog as the mayor’s companion and calls the actual police.','forest',[
 ['Return the terrier yourself','The neighbor lets you explain before calling again.',{sanity:4,miles:14}],
 ['Ask Rook to confess','His report is an impressive mixture of truth and crumbs.',{miles:15}],
 ['Search for the missing mayor','You find his sash caught in a vending machine.',{miles:16},{item:'mayor sash'}]
]);
branch('raccoon','pursuit','A volunteer search party follows the cruiser. Rook swears he was investigating a kidnapping, not committing one; the terrier chews through its leash.','forest',[
 ['Stop and explain','The search party agrees to look for the mayor together.',{sanity:4,miles:14}],
 ['Take the forest track','Branches rake the cruiser and your arm.',{health:-8,miles:18}],
 ['Let the terrier lead','She trots straight to the weigh station.',{miles:16}]
]);
route('crossfire',['middle','tunnel','roadblock']);
branch('crossfire','tunnel','June takes a drainage tunnel under the highway. Bullets spark behind you, and floodwater rises around the tires. The photograph floats across the dashboard.','shootout',[
 ['Guide June toward the light','The sedan bursts out beside the church.',{sanity:-4,miles:17}],
 ['Throw a flare behind you','Red smoke hides the tunnel entrance.',{miles:16},{item:'spent flare'}],
 ['Push through the floodwater','The cold leaves your legs shaking.',{health:-9,miles:19}]
]);
branch('crossfire','roadblock','The pursuers stop for your scattered money, but another gang car blocks the bridge. Its driver recognizes June and signals the others to hold their fire.','shootout',[
 ['Show him the photograph','He lowers his gun and opens the road.',{sanity:4,miles:15}],
 ['Race along the service shoulder','Metal screams against the concrete.',{health:-10,miles:19}],
 ['Offer the last of your cash','He takes it and tells the others you escaped.',{cash:-10,miles:16}]
]);
byId('deep').description = 'A hearse rises from a puddle. Its driver offers you a ride as the sea begins to boil beside the highway.';
byId('deep').nodes.intro.text = 'The Drowned King folds himself behind the hearse’s wheel. A vast shape rises from the sea and strikes the moving car: Cthulhu, furious that the King has carried his stolen tide inland. The windshield crazes; the King shouts for you to do something while he steers.';
byId('deep').nodes.intro.choices = [
 {label:'Fight with the emergency flare',detail:'Burning red light drives a tentacle back.',effects:{health:-6,miles:12},item:'lit flare',next:'fight'},
 {label:'Try to negotiate',detail:'Shout over the surf and ask what it wants.',effects:{sanity:-8,miles:10},next:'parley'},
 {label:'Tell the King to escape',detail:'Brace as the hearse swerves toward a tunnel.',effects:{health:-5,miles:14},next:'escape'}
];
branch('deep','fight','The flare sears a tentacle. Cthulhu slams the roof and reaches through the broken glass while the King wrestles the wheel. The King shouts for you to use whatever you found in the glovebox.','cthulhu',[
 ['Kick the reaching tentacle','You force it away from the wheel, bruising your leg.',{health:-10,miles:17}],
 ['Hold the flare to its eye','Its grip loosens in a flash of red.',{sanity:-7,miles:18},{requires:'lit flare',removeItem:'lit flare'}],
 ['Strike with the tire iron','The creature recoils; your hands ring with the blow.',{health:-6,miles:18},{requires:'tire iron'}],
 ['Use the flare as a signal','The King steers toward the light of the tunnel.',{miles:15}]
]);
branch('deep','parley','You shout that the King will return the stolen tide. The immense eye fixes on you. Behind it, a wave rises higher than the road.','cthulhu',[
 ['Offer to carry a message','The wave pauses, listening.',{sanity:-5,miles:15},{item:'tide message'}],
 ['Demand safe passage','Cthulhu’s answer shakes the windows apart.',{health:-8,miles:17}],
 ['Admit you are afraid','The great eye blinks, and the wave recedes.',{sanity:4,miles:14}]
]);
branch('deep','escape','The King takes the hearse into a tunnel as a tentacle tears the guardrail away. Water pours after you and the exit is disappearing beneath the rising tide.','cthulhu',[
 ['Shut the flood gate','You wrench the wheel until the water slows.',{health:-9,miles:18}],
 ['Direct the King through traffic','He threads the hearse between abandoned cars.',{sanity:-5,miles:17}],
 ['Throw a road flare behind you','The red light draws the creature away.',{miles:15}]
]);
byId('deep').nodes.last.text = 'Beyond the tunnel the creature sinks beneath the waves. The King asks you to tell the tide he is sorry he took it. The hearse smells of salt, hot metal, and narrowly avoided extinction.';
route('fox',['invitation','pursuit','passports']);
branch('fox','invitation','At the motel Vesper and Kit invite you to join their peculiar marriage ritual: three people, three paper crowns, and a vow to look after one another until sunrise. They make clear you can say no.','neon',[
 ['Join the ritual','You exchange ridiculous crowns and sincere promises.',{sanity:6,miles:16},{item:'paper crown'}],
 ['Decline warmly','They respect your answer and save you a seat at breakfast.',{sanity:4,miles:15}],
 ['Slip away while they prepare','Kit notices and quietly points you toward a bus stop.',{miles:18}]
]);
branch('fox','pursuit','The headlights behind you belong to the nightclub owner’s hired driver. Kit reaches for the smoke machine while Vesper offers you the map and an apologetic smile.','neon',[
 ['Work the smoke machine','The pursuer loses you in a violet cloud.',{sanity:-4,miles:18}],
 ['Switch cars at the motel','The night clerk arranges a battered replacement.',{cash:-12,miles:16}],
 ['Leave by the back entrance','Kit guides you through a garden and over a low wall.',{health:-5,miles:17}]
]);
branch('fox','passports','Kit shows you their passports and says the owner has been threatening to report them. Vesper offers you a choice: help them reach the diner, or leave safely at the next stop.','neon',[
 ['Help plan their escape','You find a side road around the owner’s car.',{sanity:4,miles:16}],
 ['Leave at the next stop','They respect your decision and pay for a taxi onward.',{cash:10,miles:15}],
 ['Call the motel clerk','She opens the service gate and waves you through.',{miles:18}]
]);

delete byId('deep').nodes.middle;
delete byId('fox').nodes.middle;

// Three more journeys respond to the passenger's first decision with different scenes.
route('loop',['middle','notebook','proof']);
branch('loop','notebook','Nina’s notebook records hundreds of failed attempts: lane changes, shortcuts, even abandoning the cab. In the margin, one untried possibility is underlined: ask the truck driver why he swerves.','neon',[
 ['Call the trucker','He says his brakes fail at the bend; Nina warns him early.',{sanity:5,miles:16}],
 ['Read tomorrow’s entry','It is blank except for your handwriting: keep going.',{sanity:-5,miles:18}],
 ['Mark the broken pavement','The trucker sees your warning and slows.',{health:-4,miles:17}]
]);
branch('loop','proof','The predicted meteor flashes across the windscreen. Nina pulls over before the predicted flat, and the same blue truck appears behind you, horn blaring.','neon',[
 ['Change the tire together','Your hands shake, but the cab is ready before the truck arrives.',{health:-5,miles:17}],
 ['Flag the truck down','Its driver reveals he has been looping too.',{sanity:-4,miles:15}],
 ['Drive on the damaged tire','The wheel survives just long enough to clear the bend.',{miles:19}]
]);
route('schoolbus',['middle','rollcall','permission']);
branch('schoolbus','rollcall','You count the class again at the crossing. One child has no name on Miss Chalk’s list. He says he missed the bus that morning and has waited here ever since.','forest',[
 ['Make him a name tag','Miss Chalk welcomes him aboard and the bell stops.',{sanity:6,miles:15},{item:'spare name tag'}],
 ['Ask the class to make room','A dozen children squeeze together without complaint.',{miles:17}],
 ['Help him cross the tracks','The rails chill you to the bone, but he reaches the door.',{health:-6,miles:18}]
]);
branch('schoolbus','permission','The slips list an aquarium, but the address is now a construction site. Miss Chalk worries that changing the destination would break a promise made decades ago.','forest',[
 ['Find the aquarium’s new address','A faded billboard points toward the coast.',{miles:18}],
 ['Ask the children to vote','They choose any place where they can see fish.',{sanity:5,miles:15}],
 ['Find fish in the creek','The children crowd around the water, delighted.',{health:-4,miles:16}]
]);
route('siren',['dispatch','repair','middle']);
branch('siren','dispatch','The cyclist is stranded beside a broken bridge. Mercy’s dispatcher sends a second call at the same time: a mechanic searching for a lost robot dog.','road',[
 ['Carry the cyclist over','Mercy calls ahead to arrange a safe pickup.',{health:-7,miles:17}],
 ['Guide the cyclist around the bridge','The detour passes the missing robot dog.',{miles:16},{item:'robot dog tag'}],
 ['Call the mechanic for help','She arrives with a ramp and a thermos of tea.',{sanity:5,miles:14}]
]);
branch('siren','repair','The hot pipe is cracked. Mercy calculates that it can reach the mechanic or answer one emergency call, but not both without a repair.','road',[
 ['Patch the pipe','Your improvised bandage holds until the shop.',{health:-6,miles:18}],
 ['Ask a passing mechanic','She follows Mercy to the call and repairs it afterward.',{miles:16}],
 ['Cool the engine and wait','Mercy talks you through breathing exercises.',{sanity:5,miles:14}]
]);

// New rides use two diverging second scenes, converging for a third and final beat.
const extendedRide = (id, title, driver, subtitle, car, vehicle, color, portrait, risk, tag, scene, description, beats) => {
  const choice = ([label, detail, effects, next, extra = {}]) => ({ label, detail, outcome: detail, effects, next, ...extra });
  const nodes = Object.fromEntries(Object.entries(beats).map(([name, [text, choices]]) => [name, { text, choices: choices.map(choice) }]));
  encounters.push({ id, title, driver, subtitle, car, vehicle, color, portrait, risk, tag, scene, description, nodes, start: 'intro' });
};

extendedRide('jury','The People Versus Night','Foreperson Pearl','Everyone is dressed for judgment','Stretch limousine','sedan','#c8beb5','driver','MEDIUM','TRIAL','neon','A limousine stops. Twelve mannequins turn their heads toward you in perfect silence.', {
 intro:['Pearl, a mannequin in a judge’s wig, says the jury has been summoned to try the night for keeping people awake. The defendant is everywhere outside the windows.',[
  ['Represent the night','Pearl hands you a brief made entirely of black paper.',{miles:10},'defense'],['Represent the sleepless','The jury rearranges itself to hear your complaint.',{miles:11},'prosecution'],['Ask for jury pay','Pearl gives you a few dollars and appoints you bailiff.',{cash:8,miles:10},'prosecution']]],
 defense:['You argue that darkness gives tired people somewhere to hide. A juror removes her painted eyes and sets them on the table as evidence.',[
  ['Call a witness','The driver describes watching his daughter sleep.',{sanity:5,miles:12},'deliberation'],['Present the alien coin','The jury considers an exhibit from another sky.',{miles:15},'deliberation',{requires:'alien coin'}],['Question the eyes','They have seen every sunrise but never slept.',{sanity:-4,miles:13},'deliberation']]],
 prosecution:['The sleepless submit their evidence: a clock with no hands and a list of names written by people who needed someone to answer.',[
  ['Read the names aloud','Pearl records each one with surprising care.',{sanity:4,miles:12},'deliberation'],['Pay for a court reporter','A mannequin types on an unplugged machine.',{cash:-8,miles:14},'deliberation'],['Ask the night to answer','A cool breeze turns the pages.',{sanity:-5,miles:13},'deliberation']]],
 deliberation:['The jurors deliberate behind a curtain in the limousine. They emerge with a compromise: the night must make room for morning, and morning must leave room for rest.',[
  ['Accept the verdict','Pearl gives you the court seal.',{miles:12},'last',{item:'court seal'}],['Appeal for one more minute','The jury grants it unanimously.',{sanity:5,miles:11},'last'],['Help write the ruling','The carbon paper stains your hands black.',{health:-4,miles:14},'last']]],
 last:['At the county line the mannequins return to their display poses. Pearl whispers that justice is mostly listening before her painted mouth closes.',[
  ['Thank the jury','The limousine carries you toward the pale horizon.',{sanity:4,miles:15},null],['Keep the verdict','It folds into a surprisingly useful map.',{miles:17},null],['Step out quietly','Pearl tips her wig as the car departs.',{miles:16},null]]]
});
extendedRide('bloodbank','The Night Shift Donors','Dr. Sable','A carpool with strict snack breaks','Blood-bank van','van','#ad777e','witch','MEDIUM','VAMPIRES','road','A blood-bank van offers a lift. Its passengers wear sunglasses despite the hour.', {
 intro:['Dr. Sable and her vampire colleagues deliver donated blood to a rural clinic. Their own supplies are carefully labeled, because nobody wants a workplace incident.',[
  ['Help make deliveries','Sable hands you the route sheet.',{miles:11},'clinic'],['Ask about the passengers','They explain their elaborate meal scheduling.',{miles:10},'carpool'],['Offer to check the cooler','The lid snaps on your fingers.',{health:-4,miles:12},'clinic']]],
 clinic:['At the clinic a refrigerator has failed. Sable must save the donated blood before the generator runs out, while the waiting room fills with anxious families.',[
  ['Carry the cooler inside','A nurse thanks you and plugs it in.',{health:-4,miles:14},'detour'],['Find the spare generator','Its starter catches on the third pull.',{miles:13},'detour'],['Buy ice from the store','The clerk brings every bag she has.',{cash:-10,miles:15},'detour']]],
 carpool:['The vampires argue about a colleague who has been skipping meals to save money. He insists he is fine while eyeing a ketchup packet with professional intensity.',[
  ['Share the emergency rations','The colleague finally admits he needs help.',{sanity:5,miles:13},'detour'],['Organize a collection','Everyone contributes, including the embarrassed vampire.',{cash:-6,miles:14},'detour'],['Suggest asking the clinic','Sable promises to arrange a staff pantry.',{miles:12},'detour']]],
 detour:['A fallen power line blocks the return route. Dawn is approaching, and the passengers begin checking their watches with identical expressions.',[
  ['Find the shaded underpass','The van passes safely beneath the road.',{miles:13},'last'],['Hold up the red thread','Sable recognizes a protective charm and smiles.',{sanity:5,miles:12},'last',{requires:'red thread'}],['Call the utility crew','They open a lane after a nervous wait.',{miles:11},'last']]],
 last:['Sable parks beneath a bridge and distributes juice boxes. She thanks you for treating her colleagues like people, which they have spent centuries trying to be.',[
  ['Accept a juice box','It is cherry, and entirely ordinary.',{health:5,miles:15},null],['Ask for a lift to the next exit','Sable knows a shaded route.',{miles:18},null],['Leave a note for the clinic','The morning staff will find it with the supplies.',{sanity:5,miles:15},null]]]
});
extendedRide('moonrepo','The Moon Is Behind on Payments','Lena Hook','One small tow for mankind','Lunar tow truck','truck','#aeb4cf','driver','HIGH','MOON','alien','A tow truck drags a silver chain into the sky. The moon has a wheel clamp on it.', {
 intro:['Lena says the moon’s lease is overdue by four billion years. Her employer wants it repossessed before dawn; the tides have filed an objection.',[
  ['Read the contract','The fine print glitters like frost.',{sanity:-4,miles:11},'contract'],['Climb the tow rig','The chain hums beneath your boots.',{health:-4,miles:12},'rig'],['Ask who signed the lease','Lena admits the signature is a crater.',{miles:10},'contract']]],
 contract:['The contract names Earth as guarantor, but a footnote exempts objects that provide essential night light. Lena cannot decide whether that includes the moon.',[
  ['Argue that it does','Lena agrees to photograph the evidence.',{sanity:4,miles:13},'appeal'],['Show the star map','It identifies the moon as a public navigational aid.',{miles:15},'appeal',{requires:'star map'}],['Offer a settlement','Lena accepts the cash as a filing fee.',{cash:-10,miles:14},'appeal']]],
 rig:['A maintenance ladder climbs the chain into thin air. You find a frightened moth the size of a horse trying to chew through the clamp.',[
  ['Help the moth','Together you loosen the last bolt.',{health:-5,miles:15},'appeal'],['Talk it down','The moth agrees to be a witness instead.',{sanity:4,miles:12},'appeal'],['Oil the clamp','It slides loose and nearly takes your glove.',{miles:14},'appeal',{item:'moon bolt'}]]],
 appeal:['At a roadside payphone, Lena calls the repossession office. Its hold music is the sound of waves. A supervisor offers one chance to appeal.',[
  ['Put the ocean on the line','The supervisor hears the tide and pauses.',{miles:13},'last'],['File a public-interest appeal','Lena gives you a stamped receipt.',{miles:12},'last',{item:'moon receipt'}],['Threaten to publicize the contract','The supervisor promises a review.',{sanity:-4,miles:14},'last']]],
 last:['The supervisor suspends collection pending review. The moon remains overhead, with a pale ring where the clamp was. Lena looks relieved to have lost.',[
  ['Watch the tide settle','The sea sends a long breath up the shore.',{sanity:5,miles:15},null],['Help coil the chain','Lena drops you farther along the highway.',{health:-4,miles:18},null],['Keep the receipt','It glows just enough to read by.',{miles:16},null]]]
});
extendedRide('cake','The Last Slice','Madame Crumb','A funeral in seven tiers','Wedding-cake hearse','hearse','#e2c4bd','driver','MEDIUM','FUNERAL','road','A hearse carries a wedding cake beneath a black veil. A procession of bakers follows on bicycles.', {
 intro:['Madame Crumb is burying a cake that waited fifty years for a wedding that never happened. The couple stayed together anyway, and ate toast every anniversary.',[
  ['Ride with the cake','Crumb makes room beside the enormous box.',{miles:10},'hearse'],['Speak to the bakers','They offer conflicting memories of the recipe.',{miles:11},'bakers'],['Ask about the couple','Crumb says both died last winter, still holding hands.',{sanity:-4,miles:12},'hearse']]],
 hearse:['The cake begins to sing from inside its box, softly and terribly out of tune. Crumb says the yeast was always ambitious.',[
  ['Sing along','The cake finds a harmony that almost works.',{sanity:4,miles:13},'service'],['Open the box','A sugar rose unfolds and pricks your finger.',{health:-4,miles:14},'service',{item:'sugar rose'}],['Ask it to be quiet','The cake hums respectfully under its breath.',{miles:12},'service']]],
 bakers:['The bakers cannot agree whether the ceremony should celebrate the couple or mourn the uneaten cake. Their bicycle bells grow increasingly argumentative.',[
  ['Suggest both','The bells settle into a gentle rhythm.',{sanity:5,miles:13},'service'],['Buy everyone coffee','The argument pauses for a welcome sip.',{cash:-8,miles:14},'service'],['Read the old recipe','A handwritten note says: share generously.',{miles:12},'service']]],
 service:['At the cemetery the couple’s granddaughter arrives. She says her grandparents would have hated to see good cake wasted, even very old, magical cake.',[
  ['Cut ceremonial slices','The cake tastes of oranges and old summers.',{health:5,miles:12},'last'],['Ask the cake’s permission','It sings a surprisingly enthusiastic yes.',{sanity:4,miles:13},'last'],['Keep a slice for the road','Crumb wraps it carefully in wax paper.',{miles:14},'last',{item:'memorial cake'}]]],
 last:['The procession leaves crumbs for the birds. The granddaughter takes the sugar couple from the top and places them together beside the headstone.',[
  ['Leave a flower','Crumb thanks you for attending.',{sanity:5,miles:15},null],['Help clear the dishes','The bakers give you a lift to the highway.',{miles:18},null],['Share a story of your own','A stranger listens without interrupting.',{miles:16},null]]]
});
extendedRide('snail','The Slow Lane Outside Time','Professor Shell','Please do not rush the driver','Snail-shell caravan','caravan','#acc695','raccoon','MEDIUM','RACING','forest','A caravan pulled by a snail the size of a house waits at a freeway on-ramp marked OUTSIDE TIME.', {
 intro:['Professor Shell is late for a race that began next Thursday. The other competitors have already finished, withdrawn, and returned to apologize.',[
  ['Navigate the course','The professor hands you a map that unfolds into a field.',{miles:10},'course'],['Check on the snail','It introduces itself as Deborah and asks for lettuce.',{miles:11},'stable'],['Question the schedule','A clock politely asks you not to think so hard.',{sanity:-4,miles:12},'course']]],
 course:['The freeway loops through a desert, a kitchen, and a version of yesterday in which you stayed home. The sign for the finish points in three directions.',[
  ['Follow the smell of rain','Deborah finds the track by instinct.',{miles:14},'bend'],['Use the star map','A familiar constellation marks the real road.',{miles:15},'bend',{requires:'star map'}],['Ask the clock','It apologizes and points backward.',{sanity:-5,miles:13},'bend']]],
 stable:['Deborah has a pebble under her enormous foot. The professor worries that stopping to remove it will cost them the race.',[
  ['Remove the pebble','Deborah thanks you and picks up speed.',{health:-4,miles:15},'bend'],['Insist on a rest','The professor finally notices Deborah is tired.',{sanity:5,miles:12},'bend'],['Buy a head of lettuce','Deborah considers this excellent sportsmanship.',{cash:-6,miles:14},'bend']]],
 bend:['At the final bend another racer is stranded in a minute that keeps repeating. Deborah can win by passing, or stop to pull them free.',[
  ['Help the stranded racer','Together you haul their minute back into sequence.',{sanity:5,miles:12},'last'],['Cheer them onward','The encouragement reaches them on the next loop.',{miles:13},'last'],['Take the finish first','The professor circles back immediately afterward.',{sanity:-4,miles:15},'last']]],
 last:['The judges award Deborah a medal for finishing whenever she did. She wears it proudly while the professor drives you back into ordinary time.',[
  ['Accept a souvenir ribbon','It moves very slowly in the wind.',{miles:16},null,{item:'snail ribbon'}],['Thank Deborah','Her smile takes a while but is worth it.',{sanity:5,miles:15},null],['Ask for the next exit','It arrives before you ask.',{miles:18},null]]]
});
extendedRide('moonradio','The Moon on the Radio','DJ Undertow','Tonight’s guest is the sky','Pirate broadcast van','van','#a2add1','driver','HIGH','RADIO','neon','A pirate radio van broadcasts an interview with the moon. The actual moon is missing from the sky.', {
 intro:['DJ Undertow borrowed the moon for a live interview and cannot get it back through the studio door. The ocean is calling every phone line at once.',[
  ['Answer the ocean','A wave asks very politely for its moon back.',{miles:11},'phones'],['Inspect the studio','Moonlight leaks around a locked door.',{miles:10},'studio'],['Ask why he stole it','Undertow says the ratings were terrible.',{sanity:-4,miles:12},'phones']]],
 phones:['The callers include fishermen, insomniacs, and a wolf who has prepared a statement. Undertow wants you to choose whose call goes on air.',[
  ['Air the fishermen','Their directions help locate the highest hill.',{miles:14},'transmitter'],['Let the wolf speak','Its heartfelt howl brings several callers to tears.',{sanity:5,miles:12},'transmitter'],['Take the ocean’s call','The handset floods the console.',{health:-4,miles:15},'transmitter']]],
 studio:['The moon is squeezed into a sound booth, embarrassed and covered in foam acoustic tiles. It says it agreed to the interview but not to the sponsorship.',[
  ['Remove the door hinges','The booth opens with a shower of screws.',{health:-4,miles:15},'transmitter'],['Read the contract aloud','The moon spots an escape clause.',{miles:13},'transmitter'],['Show the moon receipt','It recognizes Lena’s official stamp and brightens.',{sanity:5,miles:14},'transmitter',{requires:'moon receipt'}]]],
 transmitter:['On the highest hill, Undertow points the transmitter skyward. The moon needs a clear signal and a reason to trust that nobody will bottle its light again.',[
  ['Make a public apology','Undertow promises never to sell the recording.',{sanity:5,miles:12},'last'],['Tune the antenna','Sparks jump over your fingertips.',{health:-5,miles:15},'last'],['Let the moon speak','It asks everyone to look after the dark.',{miles:13},'last']]],
 last:['The moon lifts into the sky as the broadcast falls silent. A thousand radios play the same sigh of relief, followed by the shipping forecast.',[
  ['Listen to the forecast','The coast will be clear at sunrise.',{sanity:5,miles:15},null],['Help pack the equipment','Undertow gives you a longer ride.',{miles:18},null],['Take a station sticker','It glows softly in your pocket.',{miles:16},null,{item:'radio sticker'}]]]
});
extendedRide('kaiju','An Act of Giant Lizard','Adjuster Pike','Your disaster is important to us','Insurance inspection truck','truck','#c6a381','driver','HIGH','KAIJU','road','An insurance truck follows enormous footprints across the highway. Its driver offers you a clipboard.', {
 intro:['Adjuster Pike is assessing damage from a giant lizard. The policy excludes acts of gods, but says nothing about reptiles with separation anxiety.',[
  ['Interview the witnesses','A farmer points toward the grain silos.',{miles:11},'witness'],['Inspect the footprints','Each contains a tiny, intact bird nest.',{miles:10},'tracks'],['Ask about the policy','Pike hands you a stack of damp exclusions.',{sanity:-4,miles:12},'witness']]],
 witness:['The farmer explains that the creature flattened a barn searching for its lost hatchling. The hatchling is asleep in the farmer’s swimming pool.',[
  ['Help reunite them','The hatchling follows a trail of fish.',{health:-4,miles:15},'claim'],['Ask Pike to cover the barn','He finds a surprisingly generous clause.',{sanity:5,miles:12},'claim'],['Buy fish for the hatchling','It rewards you with a very wet blink.',{cash:-8,miles:14},'claim']]],
 tracks:['The footprints end at a school where the lizard has curled around a playground, guarding the children from a thunderstorm. Parents wait behind a barricade.',[
  ['Explain to the parents','They recognize their children waving from a window.',{sanity:5,miles:12},'claim'],['Offer the storm jar','The rain retreats into its familiar glass.',{miles:15},'claim',{requires:'storm jar',removeItem:'storm jar'}],['Guide the lizard away','A careful trail of school lunches does the trick.',{health:-4,miles:14},'claim']]],
 claim:['Pike must classify the damage. His employer prefers an exclusion; the families need repairs. The creature watches him fill out the form with an eye larger than his truck.',[
  ['Document every repair','The evidence leaves little room for denial.',{miles:13},'last'],['Appeal to Pike’s conscience','He signs the claim and takes a deep breath.',{sanity:5,miles:12},'last'],['Photograph the footprints','Your camera gets stepped on, but the evidence survives.',{health:-4,miles:15},'last']]],
 last:['Pike approves the claim. The lizard carries its hatchling toward the hills, and the farmer begins planning a stronger barn.',[
  ['Help Pike file the papers','He gives you a receipt for an enormous footprint.',{miles:16},null,{item:'kaiju receipt'}],['Wave to the hatchling','Its tail removes a billboard on the way out.',{sanity:4,miles:15},null],['Ride to the next town','Pike knows an undamaged road.',{miles:18},null]]]
});
extendedRide('dragonlibrary','Overdue Since the Middle Ages','Librarian Ash','Please return your dragons on time','Mobile library bus','bus','#aab69d','witch','MEDIUM','BOOKS','forest','A mobile library bus stops beneath a bridge. A small dragon peers out between the shelves.', {
 intro:['Ash says the dragon ate a book and has inherited every story inside it. The book was borrowed six hundred years ago and the late fee has become sentient.',[
  ['Talk to the dragon','It answers in three overlapping narrators.',{miles:11},'dragon'],['Read the lending ledger','The fee is currently negotiating for voting rights.',{miles:10},'ledger'],['Ask about the book','Ash remembers it was a guide to finding home.',{sanity:4,miles:12},'dragon']]],
 dragon:['The dragon has memorized the guide but cannot remember where it came from. Each time it sneezes, a different road appears on the bus floor.',[
  ['Listen to its story','One road leads to a mountain library.',{sanity:5,miles:12},'library'],['Offer the silver acorn','The dragon remembers an oak beside its old home.',{miles:15},'library',{requires:'silver acorn'}],['Catch a sneeze in a jar','The tiny road inside curls toward the mountains.',{health:-4,miles:14},'library']]],
 ledger:['The late fee demands payment in memories, coins, or a public apology. Ash insists that the library can waive fees, though the fee disagrees.',[
  ['Explain the amnesty policy','The fee reads the rules and shrinks a little.',{sanity:4,miles:12},'library'],['Pay a token fine','The fee becomes small enough to fit in an envelope.',{cash:-8,miles:14},'library'],['Offer the old coin','The fee accepts it as an antique donation.',{miles:15},'library',{requires:'old coin',removeItem:'old coin'}]]],
 library:['At the mountain library, Ash finds the dragon’s original card. The address is the library itself: it hatched in the return slot during a blizzard.',[
  ['Welcome it home','The dragon curls around the warm radiator.',{sanity:6,miles:12},'last'],['Help shelve its stories','Ash gives you a library card.',{miles:14},'last',{item:'library card'}],['Negotiate with the late fee','It agrees to become a bookmark instead.',{miles:13},'last']]],
 last:['Ash opens the doors for the morning shift. The dragon settles behind the desk, and the first reader asks it for a story with a happy ending.',[
  ['Stay for the first page','The dragon begins with your road.',{sanity:5,miles:15},null],['Return to the highway','Ash drives you toward the coast.',{miles:18},null],['Promise to visit again','The dragon marks your place with one warm claw.',{miles:16},null]]]
});

extendedRide('whalecourt','The State of the Stomach','Judge Baleen','A court with excellent acoustics','Whale-shaped bus','bus','#85aeb7','driver','HIGH','COURT','road','A bus opens its doors with a sigh. Inside, the aisle flexes and a huge heartbeat shakes the windows.', {
 intro:['Judge Baleen explains that the bus is a living whale, and its stomach is holding court. The defendant is a fisherman accused of stealing its song. The jury consists of twelve very attentive shrimp.',[
  ['Defend the fisherman','You receive a damp law book and a seat beside him.',{miles:11},'defense'],['Represent the whale','Baleen hands you a seashell full of recorded testimony.',{miles:10},'prosecution'],['Ask the whale directly','Its heartbeat accelerates and the driver translates.',{sanity:4,miles:12},'prosecution']]],
 defense:['The fisherman says he recorded the song to remember his late mother, who sang it while mending nets. The whale says it has been unable to sing since.',[
  ['Ask to hear the recording','The whale recognizes its own voice and begins to hum.',{sanity:5,miles:13},'verdict'],['Offer the tide message','The whale listens to the sea’s apology and softens.',{miles:15},'verdict',{requires:'tide message'}],['Examine the recorder','Its tangled tape nips your fingers.',{health:-4,miles:14},'verdict']]],
 prosecution:['A shrimp presents evidence: the missing song was sold as a novelty ringtone. The fisherman insists he never sold it; a gull at the recording studio looks nervous.',[
  ['Question the gull','It drops a tiny contract and confesses.',{miles:14},'verdict'],['Pay the ringtone company','The company releases its claim immediately.',{cash:-10,miles:15},'verdict'],['Ask the shrimp to investigate','They return with a soggy but convincing receipt.',{sanity:4,miles:12},'verdict']]],
 verdict:['The court finds the gull responsible and orders the recording returned. The gull objects that community service is unfair to a bird with so many enemies.',[
  ['Assign beach cleanup','The gull accepts under shrimp supervision.',{miles:13},'last'],['Suggest a public apology','It squawks sorry into a microphone.',{sanity:5,miles:12},'last'],['Help untangle the tape','The whale’s song fills the bus once more.',{health:-4,miles:14},'last',{item:'whale song tape'}]]],
 last:['Judge Baleen opens the doors at the next stop. The whale sings beneath the highway, and the fisherman hums along without recording a note.',[
  ['Listen until the chorus ends','The song settles your nerves.',{sanity:5,miles:15},null],['Thank the jury','The shrimp bow as one.',{miles:17},null],['Help the fisherman ashore','He points you toward the coast road.',{miles:16},null]]]
});
extendedRide('pageant','Miss Forever','Velour Vane','Beauty is a complicated survival skill','Velvet limousine','sedan','#c998ad','fox','HIGH','PAGEANT','neon','A velvet limousine stops. Its passengers are taxidermy contestants wearing sequined sashes and very determined expressions.', {
 intro:['Velour is driving the contestants to Miss Forever, a pageant for those the world has already declared finished. The reigning champion has vanished, leaving a crown and a threatening note.',[
  ['Investigate the note','The ink smells strongly of mothballs.',{miles:11},'mystery'],['Coach the contestants','A badger asks whether confidence can be learned.',{miles:10},'backstage'],['Ask about the champion','Velour admits the crown is insured for a fortune.',{sanity:-4,miles:12},'mystery']]],
 mystery:['The note demands that the crown be left beside the highway. Behind the limousine, a pickup full of antique dealers keeps its headlights suspiciously low.',[
  ['Set a decoy crown','The dealers chase a glittering hubcap.',{miles:15},'finale'],['Show the court seal','Velour summons an actual officer to hear the complaint.',{miles:14},'finale',{requires:'court seal'}],['Confront the dealers','They retreat after knocking you against a door.',{health:-6,miles:14},'finale']]],
 backstage:['The contestants confess the champion left voluntarily. She was tired of being judged and wanted to open a repair shop for other forgotten things.',[
  ['Protect her secret','The badger straightens her sash with relief.',{sanity:5,miles:13},'finale'],['Call the repair shop','The champion sends a message wishing everyone luck.',{miles:14},'finale'],['Buy sewing supplies','A ripped sash becomes a spectacular cape.',{cash:-8,miles:15},'finale']]],
 finale:['At the pageant, the dealers try to claim the crown. Velour asks the contestants what the prize should mean if winning makes them someone else’s property.',[
  ['Give the crown to everyone','They break it into little sparkling stars.',{sanity:5,miles:12},'last',{item:'crown star'}],['Report the attempted theft','The dealers leave before the officer arrives.',{miles:14},'last'],['Hold the stage door','The contestants escape the dealers together.',{health:-4,miles:15},'last']]],
 last:['The badger wins by refusing to be scored. The audience applauds; one antique dealer applauds too, until the others notice.',[
  ['Applaud with them','Velour drives you toward the coast.',{sanity:4,miles:15},null],['Help pack the costumes','The contestants wave from the limousine.',{miles:17},null],['Ask for the scenic route','Velour knows a road full of stars.',{miles:16},null]]]
});
extendedRide('blacktoll','A Small Fee for Infinity','Tollkeeper Null','Exact change or exact regret','Black service van','van','#817d9e','driver','EXTREME','COSMIC','alien','A tollbooth hangs over a tiny black hole. Its attendant pulls up in a van and asks for help balancing the books.', {
 intro:['Null explains that the black hole collects everything dropped through the toll slot, including a child’s lost shoe and last Tuesday. Its appetite has begun to exceed its paperwork.',[
  ['Audit the accounts','The figures rearrange themselves to avoid tax.',{sanity:-4,miles:11},'audit'],['Inspect the toll slot','A small hand waves from the other side.',{miles:10},'rescue'],['Ask about the shoe','Null says its owner has waited a very long time.',{miles:12},'rescue']]],
 audit:['The ledger shows that the black hole has been charged interest on its own mass. If the debt comes due, it will swallow the booth, the road, and Null’s lunch.',[
  ['Dispute the interest','Null circles a clause written in shrinking ink.',{miles:14},'horizon'],['Offer the alien coin','The coin is accepted as an interstellar filing fee.',{miles:15},'horizon',{requires:'alien coin',removeItem:'alien coin'}],['Pay the filing fee','A receipt emerges from the slot backwards.',{cash:-10,miles:15},'horizon']]],
 rescue:['A child reaches through the slot, but the pull is growing stronger. Null ties a rope to the van and asks you to keep hold while she reaches inside.',[
  ['Hold the rope','You pull the child and one muddy shoe to safety.',{health:-6,miles:15},'horizon'],['Talk the child through it','The little hand follows your voice.',{sanity:4,miles:13},'horizon'],['Use the red thread','The protective thread finds a path through the dark.',{miles:14},'horizon',{requires:'red thread'}]]],
 horizon:['The child is safe, but the booth begins to slide toward its own slot. Null discovers a switch marked CLOSE ACCOUNT, guarded by an aggressively small padlock.',[
  ['Use the duplicate key','It fits as if the lock had been expecting you.',{miles:15},'last',{requires:'duplicate key'}],['Pry the lock open','The metal snaps and cuts your palm.',{health:-5,miles:14},'last'],['Ask the black hole to stop','It pauses, apparently grateful someone asked.',{sanity:4,miles:12},'last'],
  ['Follow the creased map around it','A penciled service route bends safely around the booth.',{miles:15},'last',{requires:'creased map'}]]],
 last:['The account closes. The black hole shrinks to the size of a marble and rolls into Null’s lunchbox, where it eats exactly one sandwich.',[
  ['Accept your receipt','It shows a balance of one saved afternoon.',{miles:16},null,{item:'void receipt'}],['Walk the child to safety','Null drives you both to the next town.',{sanity:5,miles:15},null],['Ask for a ride onward','The van avoids every pothole by going around space.',{miles:18},null]]]
});
extendedRide('gpsdream','Recalculating the Dream','Mina and the Navigator','Turn left at the impossible','GPS-equipped taxi','taxi','#8babb9','driver','HIGH','DREAM','neon','A taxi stops with a GPS giving directions in its sleep. Its driver says the road has begun obeying it.', {
 intro:['Mina’s navigation system is possessed by a dream of finding its inventor. Every instruction changes the landscape: a left turn creates a staircase, and a right turn creates a sea.',[
  ['Follow the staircase','Mina drives upward between sleeping streetlights.',{miles:11},'stairs'],['Take the sea road','The taxi glides over water under a paper moon.',{miles:10},'sea'],['Ask the GPS what it wants','It whispers an address it cannot remember.',{sanity:4,miles:12},'stairs']]],
 stairs:['At the top, a corridor of doors contains every destination the GPS has ever forgotten. A door marked HOME is locked from the inside.',[
  ['Knock gently','A child’s voice asks if the machine is lost.',{sanity:5,miles:13},'address'],['Try the duplicate key','The door opens onto a map of the coast.',{miles:15},'address',{requires:'duplicate key'}],['Force the door','You fall through a pile of old route maps.',{health:-5,miles:14},'address']]],
 sea:['On the dream sea, a lighthouse flashes turn instructions in a language of blinks. The taxi begins to sink whenever Mina says the word destination.',[
  ['Decode the light','It spells the name of the inventor’s street.',{miles:14},'address'],['Sing instead of speaking','The taxi rises on a remarkably catchy chorus.',{sanity:5,miles:12},'address'],['Patch the leaking door','The sea pinches your hand through the seal.',{health:-4,miles:15},'address']]],
 address:['The address belongs to a closed electronics shop. Inside, the inventor’s granddaughter is repairing a radio and remembers the device as her grandmother’s proudest invention.',[
  ['Let her speak to it','She tells the GPS it was never forgotten.',{sanity:6,miles:12},'last'],['Show the radio sticker','She recognizes the station her grandmother loved.',{miles:14},'last',{requires:'radio sticker'}],['Help repair the speaker','The GPS thanks you in a voice free of static.',{health:-4,miles:15},'last']]],
 last:['The GPS wakes and the ordinary road returns. It asks Mina, very politely, whether it might choose the music for once.',[
  ['Let it choose','A terrible song fills the taxi and everyone sings.',{sanity:5,miles:15},null],['Take its suggested route','For once, the directions lead somewhere real.',{miles:18},null],['Accept a printed map','The GPS draws a small heart by the coast.',{miles:16},null,{item:'dream map'}]]]
});

extendedRide('carwash','The Church of Clean Slates','Sister Suds','Your past, now with a fresh scent','Car wash van','van','#93b4bb','witch','HIGH','MEMORY','road','A van pulls up dripping foam. Its driver offers a ride through a car wash that promises to remove more than dirt.', {
 intro:['Sister Suds belongs to a roadside cult that washes painful memories away. Tonight a storm has knocked out the rinse cycle, and a customer is trapped inside remembering everything at once.',[
  ['Help rescue the customer','Suds gives you a waterproof lantern.',{miles:11},'rescue',{relation:1}],['Ask about the cult','She admits some members miss what they washed away.',{miles:10},'records'],['Demand a free wash','Suds reluctantly opens the gate.',{sanity:-4,miles:12},'records',{relation:-1}]]],
 rescue:['Inside, enormous brushes thrash like wet animals. The customer calls for help from a car full of soap and photographs of a childhood kitchen.',[
  ['Stop the brushes','Your hand catches on the emergency lever, but the brushes stop.',{health:-5,miles:14},'rinse',{relation:1}],['Talk the customer through it','They follow your voice to the open door.',{sanity:5,miles:12},'rinse'],['Use the red thread','The thread leads both of you through the foam.',{miles:15},'rinse',{requires:'red thread'}]]],
 records:['In the office, jars of cloudy water hold the memories customers surrendered. One jar is labeled DO NOT SHAKE, which appears to be an instruction to the storm.',[
  ['Read the consent forms','Several customers asked to get their memories back.',{miles:13},'rinse'],['Steady the jars','You save the shelf but a glass cuts your hand.',{health:-4,miles:14},'rinse',{relation:1}],['Buy a clean towel','Suds wraps the most fragile jars.',{cash:-8,miles:15},'rinse']]],
 rinse:['The storm breaks the roof open. Suds can rinse the memories into the drain or let each customer decide what to keep. The trapped customer asks for time to think.',[
  ['Return the jars to their owners','Suds writes careful names on every lid.',{sanity:5,miles:12},'last',{relation:1}],['Hold the broken roof','Everyone gets out before it falls.',{health:-5,miles:15},'last'],['Open the emergency drain','The flood subsides without touching the jars.',{miles:14},'last']]],
 last:['At dawn the customer takes one memory home and leaves another behind. Suds removes the sign promising a perfect clean slate.',[
  ['Help paint a new sign','It reads: TAKE YOUR TIME.',{sanity:5,miles:15},null],['Accept a dry towel','It smells pleasantly of ordinary soap.',{miles:16},null,{item:'clean towel'}],['Ask for a ride onward','Suds follows the first clear road.',{miles:18},null]]]
});
extendedRide('birthdayhearse','Many Unhappy Returns','Morrow','The party is already behind you','Backwards hearse','hearse','#c8afc4','driver','MEDIUM','FUTURE','road','A hearse reverses down the highway at alarming speed. Its driver says she is late for a birthday that has not happened yet.', {
 intro:['Morrow delivers cakes to people on their future birthdays. The hearse drives backward because the candles remember where they will be lit.',[
  ['Help sort the cakes','A label shows tomorrow’s date and your name.',{miles:11},'cakes',{relation:1}],['Ask to see your future','Morrow warns you the candles are unreliable.',{sanity:-4,miles:12},'future'],['Tell her to slow down','She brakes without taking her eyes off the rearview mirror.',{miles:10},'future']]],
 cakes:['One cake is missing its recipient. Another is labeled FOR THE PERSON WHO FINALLY COMES HOME, and the frosting is beginning to cry.',[
  ['Comfort the cake','Its candles stop flickering.',{sanity:5,miles:12},'party'],['Check the delivery ledger','The missing name belongs to Morrow herself.',{miles:14},'party'],['Offer memorial cake','The two cakes exchange recipes in whispers.',{miles:15},'party',{requires:'memorial cake'}]]],
 future:['A candle shows you an empty room, then fills it with people arriving late. Morrow says the future is a guest list, not a guarantee.',[
  ['Blow out the candle','The room becomes a blank page.',{sanity:4,miles:13},'party'],['Ask Morrow about hers','She has never received a cake of her own.',{miles:14},'party',{relation:1}],['Look closer','The wick flares and singes your hand.',{health:-4,miles:15},'party']]],
 party:['At a deserted rest stop, Morrow finds a table set for one. The cake meant for her has arrived before she knew she needed it.',[
  ['Celebrate with her','She laughs and makes a wish she keeps private.',{sanity:5,miles:12},'last',{relation:1}],['Light the candles','Their flames burn steadily in the wind.',{miles:14},'last'],['Fetch a chair','The folding leg snaps against your fingers.',{health:-4,miles:15},'last']]],
 last:['The hearse turns around for the first time. Morrow says she might drive forward more often, provided the cake agrees.',[
  ['Share the last slice','It tastes like a birthday you have yet to enjoy.',{health:5,miles:15},null],['Wish her a happy birthday','She gives you a paper candle.',{miles:16},null,{item:'paper candle'}],['Ask for the coast road','Morrow accelerates in the usual direction.',{miles:18},null]]]
});
extendedRide('octoconductor','The Highway in Eight Parts','Maestro Ink','Please do not honk during the adagio','Orchestra bus','bus','#8eabb1','driver','MEDIUM','MUSIC','road','An octopus in a conductor’s coat directs traffic from the wheel of an orchestra bus.', {
 intro:['Maestro Ink conducts the highway itself: trucks provide percussion, tires hum the bass, and impatient horns ruin every quiet passage. A missing bridge threatens tonight’s performance.',[
  ['Help find a detour','Ink offers you a spare baton.',{miles:11},'detour',{relation:1}],['Join the orchestra','A trombonist makes room beside a stack of music.',{miles:10},'orchestra'],['Honk along','Ink winces at your interpretation of silence.',{sanity:-4,miles:12},'orchestra',{relation:-1}]]],
 detour:['The detour passes an abandoned bridge where a crew of beavers is arguing over the engineering. They insist the river deserves a solo.',[
  ['Listen to the beavers','Their plan makes room for both bridge and river.',{sanity:5,miles:12},'concert',{relation:1}],['Carry the planks','A splinter catches your palm.',{health:-4,miles:15},'concert'],['Show the creased map','It reveals a safe crossing downstream.',{miles:15},'concert',{requires:'creased map'}]]],
 orchestra:['The orchestra has lost its sheet music in the wind. The brass section knows the tune, but the violins are playing tomorrow’s weather forecast.',[
  ['Collect the pages','You catch the final sheet against a fence.',{health:-4,miles:14},'concert'],['Let the musicians improvise','The forecast becomes a surprisingly moving melody.',{sanity:5,miles:12},'concert'],['Pay for replacement copies','A roadside printer works very quickly.',{cash:-8,miles:15},'concert']]],
 concert:['Ink raises eight arms as the traffic gathers. One frightened motorist has stopped in the middle of the road, and the entire orchestra holds its breath.',[
  ['Guide the motorist to safety','The music resumes one instrument at a time.',{sanity:5,miles:12},'last',{relation:1}],['Signal with the baton','The trucks slow into a gentle rhythm.',{miles:14},'last'],['Help push the stalled car','The percussion section applauds your effort.',{health:-5,miles:15},'last']]],
 last:['The final chord rolls across the desert. Ink bows with all eight arms, briefly leaving nobody at the wheel before remembering the ninth responsibility.',[
  ['Applaud the orchestra','Ink gives you a signed program.',{miles:16},null,{item:'concert program'}],['Ask for a quiet ride','The bus travels in companionable silence.',{sanity:5,miles:15},null],['Take the encore route','The orchestra plays you toward the coast.',{miles:18},null]]]
});
extendedRide('vending','Exact Change for a Miracle','Vend-O-Matic','All sales are existential','Vending-machine taxi','taxi','#d2aa85','robot','MEDIUM','SNACKS','neon','A vending machine drives a taxi. Its display reads INSERT DESTINATION, THEN COIN.', {
 intro:['Vend-O-Matic sells impossible snacks: a biscuit that remembers your name, crisps from a vanished country, and gum that makes apologies easier. Its coin slot is jammed with a tiny key.',[
  ['Help free the key','The machine thanks you in a shower of receipts.',{miles:11},'repair',{relation:1}],['Ask about the snacks','It recites ingredients in three dead languages.',{miles:10},'snacks'],['Hit the coin slot','The machine asks you not to do that again.',{health:-4,miles:12},'repair',{relation:-1}]]],
 repair:['The key belongs to a child who locked a wish inside the machine. Vend-O-Matic cannot return it without opening the compartment containing every unsold wish.',[
  ['Find the child','She asks only for her key back.',{sanity:5,miles:12},'delivery',{relation:1}],['Carefully unlock the panel','A spring snaps against your hand.',{health:-4,miles:15},'delivery'],['Offer the duplicate key','It opens the panel without disturbing the wishes.',{miles:15},'delivery',{requires:'duplicate key'}]]],
 snacks:['A customer wants to buy the biscuit that remembers his mother’s voice. Vend-O-Matic worries that selling a memory might be a kind of theft.',[
  ['Ask the biscuit','It consents on condition that it gets tea.',{sanity:5,miles:12},'delivery'],['Buy tea for both','The customer and biscuit settle into conversation.',{cash:-8,miles:15},'delivery'],['Suggest sharing the recipe','The customer can remember without taking anything.',{miles:14},'delivery',{relation:1}]]],
 delivery:['At the next stop, the child and the customer wait beneath a flickering sign. Vend-O-Matic asks whether it has done a good job.',[
  ['Thank it sincerely','Its display glows a little brighter.',{sanity:5,miles:12},'last',{relation:1}],['Return the child’s key','She unlocks a box full of ordinary drawings.',{miles:14},'last'],['Help carry the snack crates','A tin lands on your toe.',{health:-4,miles:15},'last'],['Ask for its secret route','It shares the road it reserves for trusted friends.',{miles:16},'last',{requiresTrust:2}]]],
 last:['The machine returns the key and gives the customer his tea. Its receipt prints a single word: ENOUGH.',[
  ['Keep the receipt','It stays warm in your pocket.',{miles:16},null,{item:'vending receipt'}],['Share a biscuit','It remembers your name correctly.',{health:5,miles:15},null],['Ask for the coast','The meter displays a smile instead of a fare.',{miles:18},null]]]
});

extendedRide('lobsterstars','A Clawful of Stars','Professor Claw','Astronomy under pressure','Observatory pickup','truck','#ba8069','shark','MEDIUM','STARS','road','A lobster in a lab coat drives a pickup with a telescope strapped to its bed.', {
 intro:['Professor Claw reports that someone has stolen a constellation from the observatory. A blank patch of sky travels above the pickup.',[
  ['Examine the telescope','A damp fingerprint blurs the lens.',{miles:10},'scope'],['Follow the wet footprints','They lead toward the old reservoir.',{miles:11},'shore'],['Offer your star map','The professor recognizes the missing pattern.',{miles:14},'scope',{requires:'star map'}]]],
 scope:['The telescope points toward a light moving beneath the reservoir. Claw wonders whether the thief needed the stars more than the sky did.',[
  ['Adjust the lens','The light resolves into a jar.',{miles:13},'meeting'],['Sketch the pattern','Claw tucks your drawing into a pocket.',{sanity:4,miles:12},'meeting'],['Climb the wet railing','You slip, but see a boat below.',{health:-4,miles:15},'meeting']]],
 shore:['A child waits on the bank with a jar of starlight and a note asking the sky for one more night.',[
  ['Listen to the child','The jar is a lantern for her grandfather.',{sanity:4,miles:12},'meeting'],['Inspect the jar','The glass is cold enough to sting.',{health:-4,miles:14},'meeting'],['Offer a lift','The child climbs aboard with the jar.',{miles:13},'meeting']]],
 meeting:['At the observatory, the child asks to keep the lantern until her grandfather can see it. The professor holds a spare lens toward the dark.',[
  ['Make a copy of the pattern','The lens casts bright stars on the ceiling.',{sanity:5,miles:12},'last'],['Carry the lantern carefully','Claw clears a place on the dashboard.',{miles:15},'last'],['Ask the stars what they want','They flicker in no recognizable code.',{sanity:-3,miles:13},'last']]],
 last:['The professor folds the telescope and checks the sky once more. The road ahead shines with small reflected points.',[
  ['Keep the sketch','A constellation fits in your pocket.',{miles:16},null,{item:'star sketch'}],['Thank the professor','A claw clicks against the steering wheel.',{sanity:4,miles:15},null],['Head toward the coast','The pickup takes the long downhill.',{miles:18},null]]]
});
extendedRide('gnomeparole','The Garden Board','Warden Moss','Good behavior is a small thing','Garden supply van','van','#839c73','raccoon','MEDIUM','GARDEN','forest','A garden van stops beside you. Small painted faces peer through its rear windows.', {
 intro:['Warden Moss carries three lawn gnomes to a parole hearing. They have been accused of moving garden ornaments after dark.',[
  ['Hear their side','The gnomes speak one at a time.',{miles:11},'testimony'],['Inspect the evidence','A tiny wheelbarrow rattles in the back.',{miles:12},'evidence'],['Ask for a fee','Moss pays you to take notes.',{cash:7,miles:10},'testimony']]],
 testimony:['One gnome says the ornaments were moved out of the path of a lawn mower. Another insists they were rehearsing a parade.',[
  ['Ask about the mower','The smallest gnome produces a blade of grass.',{miles:13},'hearing'],['Take careful notes','Moss lends you a pencil.',{sanity:4,miles:12},'hearing'],['Challenge the parade story','Three painted smiles become uncomfortable.',{sanity:-3,miles:14},'hearing']]],
 evidence:['The wheelbarrow contains a broken ceramic flamingo and a stack of seed packets. Moss asks what should be presented first.',[
  ['Show the seed packets','The board likes a practical plan.',{miles:13},'hearing'],['Repair the flamingo with red thread','The leg holds long enough for testimony.',{miles:15},'hearing',{requires:'red thread'}],['Carry the flamingo','A sharp edge catches your hand.',{health:-4,miles:14},'hearing'],['Describe the wheelbarrow','Moss writes every detail down.',{miles:12},'hearing']]],
 hearing:['The board assembles on a picnic table and asks whether the gnomes can be trusted around decorative property.',[
  ['Propose community gardening','The board taps its tiny boots.',{sanity:4,miles:12},'last'],['Ask for another hearing','Everyone agrees to bring sandwiches.',{miles:14},'last'],['Speak for the flamingo','Its silence is entered into the record.',{miles:15},'last']]],
 last:['Moss loads the little chairs back into the van. The gnomes wave from a row of flowerpots.',[
  ['Take a seed packet','The label promises something blue.',{miles:16},null,{item:'blue seeds'}],['Wave back','A ceramic hand waves twice.',{sanity:5,miles:15},null],['Ask for the highway','Moss finds an untrimmed shortcut.',{miles:18},null]]]
});
extendedRide('shadowpawn','The Shape of a Bargain','Penny Shade','Every silhouette has a price','Pawnshop box truck','truck','#aa8f80','witch','MEDIUM','BARGAIN','neon','A box truck with a pawnshop sign stops. Its windows are crowded with framed silhouettes.', {
 intro:['Penny buys shadows from people in need of cash. Tonight a customer wants hers back, but the claim ticket has faded blank.',[
  ['Examine the ticket','A crease hides a faint thumbprint.',{miles:10},'ticket'],['Ask the shadows','Several frames rattle at once.',{miles:11},'frames'],['Offer to pay','Penny accepts a small search fee.',{cash:-5,miles:12},'ticket']]],
 ticket:['The ticket has an imprint of a bird beside the thumbprint. Penny opens the ledger to a page full of careful drawings.',[
  ['Compare the drawings','One shows a bird on a shoulder.',{miles:13},'claim'],['Use the mechanical pigeon','Its silhouette points toward one frame.',{miles:15},'claim',{requires:'mechanical pigeon'}],['Rub the paper gently','The old ink stains your fingers.',{sanity:4,miles:12},'claim']]],
 frames:['Behind the glass, shadows imitate the truck’s movements a fraction too slowly. One holds out a hand.',[
  ['Match the customer’s gesture','A frame taps back.',{miles:13},'claim'],['Turn on a lamp','A bulb bursts in your hand.',{health:-4,miles:14},'claim'],['Listen for a voice','Penny hears a familiar whistle.',{sanity:4,miles:12},'claim']]],
 claim:['Two shadows fit the description. The customer waits outside while Penny asks you to decide how to tell them apart.',[
  ['Invite them into the light','One stretches toward its owner.',{sanity:4,miles:12},'last'],['Ask the customer to whistle','The right shadow begins to dance.',{miles:15},'last'],['Read the ledger aloud','Penny finds an overlooked signature.',{miles:14},'last']]],
 last:['Penny closes the truck and offers you a small empty frame. The customer walks away beneath the streetlights.',[
  ['Keep the frame','It reflects only the road behind you.',{miles:16},null,{item:'empty frame'}],['Decline politely','Penny hangs it back on the wall.',{sanity:4,miles:15},null],['Ask for a lift west','The shop bell rings with each bump.',{miles:18},null]]]
});
extendedRide('tomorrowcrew','One Second of Road','Foreman Tick','Paving the immediate future','Road crew truck','truck','#d6ad6c','robot','MEDIUM','ROADWORK','checkpoint','A road crew truck crawls along the shoulder, its warning lights blinking just ahead of the pavement.', {
 intro:['Foreman Tick explains that the crew lays the road one second before traffic reaches it. Their clock has started losing time.',[
  ['Inspect the clock','Its second hand trembles.',{miles:11},'clock'],['Help the crew','They pass you a reflective vest.',{miles:10},'crew'],['Show the lucky bolt','Tick uses it to secure the clock casing.',{miles:14},'clock',{requires:'lucky bolt'}]]],
 clock:['Inside the clock a grain of gravel has wedged itself between two gears. The next truck is approaching.',[
  ['Remove the gravel','The second hand jumps forward.',{miles:13},'gap'],['Hold the casing steady','Tick frees the gear with a screwdriver.',{sanity:4,miles:12},'gap'],['Shake the clock','The casing clips your knuckles.',{health:-4,miles:14},'gap']]],
 crew:['The crew rolls out a strip of fresh asphalt while the edge of the road approaches their boots.',[
  ['Direct traffic','A line of trucks slows to a crawl.',{miles:13},'gap'],['Carry a warning sign','Its metal edge scrapes your arm.',{health:-4,miles:14},'gap'],['Count aloud','The crew finds a shared rhythm.',{sanity:4,miles:12},'gap']]],
 gap:['A small gap remains between the finished road and the next strip. Tick asks for one last coordinated push.',[
  ['Count everyone in','The roller moves on your mark.',{sanity:4,miles:12},'last'],['Hold the warning light','Drivers give the crew room.',{miles:14},'last'],['Pull the strip straight','It meets the old pavement cleanly.',{miles:15},'last']]],
 last:['The crew parks for a brief break. Beyond their truck, the next second of road gleams under the lamps.',[
  ['Keep the reflective vest','A useful little patch of visibility.',{miles:16},null,{item:'reflective vest'}],['Share their coffee','Tick pours an extra cup.',{sanity:5,miles:15},null],['Continue west','The truck escorts you past the work zone.',{miles:18},null]]]
});

extendedRide('lostandfound','The Things Left Behind','Clerk Wisp','Every loss has a claim number','Lost-property van','van','#aabbb6','ghost','MEDIUM','LOST','forest','A pale clerk drives a van whose windows are filled with tagged umbrellas, gloves, and keys.', {
 intro:['Clerk Wisp collects objects lost along Route 13. Tonight a little ghost has arrived to claim a whistle, but its ticket is blank.',[
  ['Examine the claim ticket','A faint thumbprint appears in the lamplight.',{miles:11},'ticket'],['Search the shelves','A row of whistles answers with tiny notes.',{miles:10},'shelves'],['Ask the ghost to describe it','It whistles a tune without making a sound.',{sanity:4,miles:10},'shelves']]],
 ticket:['The ticket is marked with the shape of a ferry. Wisp unfolds a route ledger across the dashboard.',[
  ['Compare the ferry records','One entry mentions a silver whistle.',{miles:13},'claim'],['Ask about the crossing','Wisp remembers a very foggy morning.',{sanity:4,miles:12},'claim'],['Trace the faded ink','The paper tears against your finger.',{health:-3,miles:14},'claim'],['Consult the frequency note','A ferry broadcast matches the date in the ledger.',{miles:15},'claim',{requires:'frequency note'}]]],
 shelves:['On the shelves, a silver whistle hangs beside a brass one. The little ghost points at both and looks embarrassed.',[
  ['Play the silver whistle','A clear note makes the ghost smile.',{miles:13},'claim'],['Read the tags','One was found at the ferry dock.',{sanity:4,miles:12},'claim'],['Reach behind the shelf','A loose hook catches your sleeve and arm.',{health:-4,miles:14},'claim']]],
 claim:['Wisp finds two names on the ferry ledger: the ghost’s and a living child’s. They may both have a claim to the whistle.',[
  ['Call the child on the radio','A sleepy voice remembers sharing it.',{sanity:4,miles:12},'last'],['Offer to share the whistle','The ghost nods and points to the road ahead.',{miles:14},'last'],['Ask Wisp to check the date','The ledger reveals a family connection.',{miles:15},'last']]],
 last:['Wisp closes the ledger as a ferry horn sounds somewhere beyond the trees. The little ghost waves from the back seat.',[
  ['Keep a spare claim tag','It is blank, ready for something found.',{miles:16},null,{item:'claim tag'}],['Wave back','A transparent hand waves twice.',{sanity:5,miles:15},null],['Continue toward the coast','Wisp takes the road along the water.',{miles:18},null]]]
});
extendedRide('antlimo','The Longest Commute','Chauffeur Six','A thousand passengers, one fare','Ant-colony limousine','sedan','#bd9878','raccoon','MEDIUM','COLONY','road','A long limousine pulls over. A trail of ants moves in neat lines along its window.', {
 intro:['Chauffeur Six speaks for the ant colony operating the limousine. Their queen’s route map is missing, and the workers disagree about which exit leads home.',[
  ['Check the map envelope','A corner of the missing map peeks out.',{miles:11},'papers'],['Ask the scouts','They tap a pattern on the dashboard.',{miles:10},'scouts'],['Offer to navigate','Six thanks you on behalf of everyone.',{sanity:4,miles:10},'scouts']]],
 papers:['The map has been torn in two. One half shows a bridge; the other is caught beneath the windshield wiper.',[
  ['Match the torn edges','The road home crosses the old bridge.',{miles:13},'junction'],['Use the red thread','The halves stay together long enough to read.',{miles:15},'junction',{requires:'red thread'}],['Retrieve the other half','The wiper snaps against your hand.',{health:-4,miles:14},'junction'],['Ask Six to slow down','The map settles within reach.',{sanity:4,miles:12},'junction']]],
 scouts:['The scouts have found a sugar trail leading off the highway, but it splits at an abandoned picnic ground.',[
  ['Follow the careful scout','She leads you to the bridge sign.',{miles:13},'junction'],['Ask the workers to vote','The dashboard sounds like gentle rain.',{sanity:4,miles:12},'junction'],['Look under the picnic table','A splinter catches your finger.',{health:-3,miles:14},'junction']]],
 junction:['At the bridge, the colony finds a stranded beetle blocking the narrow approach. Six asks how to help without frightening it.',[
  ['Build a little ramp','The beetle climbs down safely.',{sanity:4,miles:12},'last'],['Wait for it to move','The colony shares a quiet moment.',{miles:14},'last'],['Guide it with a leaf','It follows the leaf off the road.',{miles:15},'last']]],
 last:['The limousine reaches a garden wall with a thousand tiny doors. Six parks carefully and the passengers begin to file out.',[
  ['Accept a sugar crystal','Six calls it a very generous tip.',{miles:16},null,{item:'sugar crystal'}],['Thank the colony','A thousand antennae wave.',{sanity:5,miles:15},null],['Ask for the next road','A scout points west.',{miles:18},null]]]
});

const vehicles = { saucer:'sedan', contraband:'foodtruck', raccoon:'sedan', crossfire:'sedan', deep:'hearse', fox:'convertible', witch:'caravan', ambulance:'ambulance', radio:'van', wedding:'sedan', taxi:'taxi', mushroom:'bus', chef:'foodtruck', clone:'sedan', shark:'truck', ghost:'sedan', circus:'caravan', lighthouse:'truck', schoolbus:'bus', loop:'taxi', siren:'ambulance', band:'caravan', diner:'foodtruck', weather:'van' };
for (const encounter of encounters) encounter.vehicle ??= vehicles[encounter.id];

const portraits = { contraband:'mara', chef:'chef', lostandfound:'wisp', antlimo:'ant', vending:'vending', octoconductor:'octopus', carwash:'suds', birthdayhearse:'morrow', ghost:'ghost', circus:'clown', shark:'shark', ambulance:'robot', siren:'robot', schoolbus:'ghost', taxi:'nina', loop:'nina', crossfire:'june', wedding:'bride', lighthouse:'keeper' };
for (const encounter of encounters) encounter.portrait = portraits[encounter.id] ?? encounter.portrait;

// Beat cues are semantic phases for the scene director, independent of story IDs.
const beatCues = {
 saucer:{intro:'abduction',middle:'hangar',shaft:'hangar',diplomacy:'hangar',last:'clear'},
 contraband:{intro:'road',middle:'checkpoint',inspection:'checkpoint',detention:'checkpoint',last:'clear'},
 crossfire:{intro:'chase',middle:'chase',tunnel:'tunnel',roadblock:'chase',last:'clear'},
 deep:{intro:'monster',fight:'monster',parley:'monster',escape:'tunnel',last:'clear'},
 carwash:{intro:'storm',rescue:'storm',records:'storm',rinse:'storm',last:'clear'}
};
for (const [id, cues] of Object.entries(beatCues)) for (const [node, beat] of Object.entries(cues)) byId(id).nodes[node].beat = beat;
byId('deep').nodes.last.scene = 'road';
byId('moonradio').nodes.last.moonless = false;

// Choices on one ride can leave facts that another driver recognizes later.
byId('radio').callbacks = [{ flag:'sky_ambassador', text:'Static might carry a message to the council you met.' }];
byId('contraband').callbacks = [{ flag:'helped_june', text:'Your time with June may help at the checkpoint.' }];
byId('whalecourt').callbacks = [{ flag:'heard_the_deep', text:'Your encounter with the deep may matter to the whale’s court.' }];
byId('saucer').nodes.diplomacy.choices.find(c => c.label === 'Answer honestly').setFlag = 'sky_ambassador';
byId('crossfire').nodes.last.choices.find(c => c.label === 'Sit with her').setFlag = 'helped_june';
byId('deep').nodes.parley.choices.find(c => c.label === 'Admit you are afraid').setFlag = 'heard_the_deep';
byId('radio').nodes.middle.choices.push({ label:'Send a message to the council', detail:'Static broadcasts your greeting toward the council beyond the sky.', effects:{sanity:5,miles:17}, next:'last', requiresFlag:'sky_ambassador' });
byId('radio').nodes.last.choices.push({ label:'Call the unknown sky', detail:'Static lets your unaddressed greeting drift into the dark.', effects:{miles:23}, next:null, excludesFlag:'sky_ambassador' });
byId('contraband').nodes.detention.choices.push({ label:'Mention June’s delivery', detail:'The officer recognizes June’s careful work and checks the manifest without further delay.', effects:{miles:16}, next:'last', requiresFlag:'helped_june' });
byId('whalecourt').nodes.verdict.choices.push({ label:'Describe the deep’s reply', detail:'Your account of the great eye makes the jury listen to the whale’s song more carefully.', effects:{sanity:5,miles:15}, next:'last', requiresFlag:'heard_the_deep' });

// A visible object can perform the same authored choice as its story button.
for (const [id, node, choiceLabel, kind, label] of [
  ['chef','origins','Read the signed waiver','papers','Read the signed waiver'],
  ['ambulance','equipment','Read the monitor','scanner','Read the monitor'],
  ['ambulance','directions','Call the old hospital','radio','Call the old hospital'],
  ['saucer','middle','Pull the cable','scanner','Pull the scanner cable'],
  ['saucer','middle','Correct the records','scanner','Correct the scanner records'],
  ['crossfire','intro','Open the envelope','papers','Open June’s envelope'],
  ['crossfire','middle','Fire the flare skyward','flare','Fire the flare skyward'],
  ['crossfire','tunnel','Throw a flare behind you','flare','Throw the flare behind you'],
  ['deep','intro','Fight with the emergency flare','flare','Fight with the emergency flare'],
  ['deep','fight','Hold the flare to its eye','flare','Hold the flare to its eye'],
  ['radio','middle','Broadcast directions home','radio','Broadcast directions home'],
  ['contraband','inspection','Show the medicine manifest','papers','Show the medicine manifest'],
  ['lostandfound','claim','Call the child on the radio','radio','Call the child on the radio'],
  ['antlimo','intro','Check the map envelope','papers','Check the map envelope'],
]) byId(id).nodes[node].choices.find(c => c.label === choiceLabel).sceneAction = {kind,label};

// An outcome is kept separately from the action prompt for journals and summaries.
for (const encounter of encounters) for (const node of Object.values(encounter.nodes)) {
  for (const choice of node.choices) choice.outcome ??= choice.detail;
}

const clamp = (n, min, max = Infinity) => Math.max(min, Math.min(max, n));
export function applyChoice(state, choice) {
  const result = { ...state, inventory: [...(state.inventory || [])], completed: [...(state.completed || [])], log: [...(state.log || [])] };
  for (const key of ['health', 'sanity', 'cash', 'fuel', 'miles']) {
    result[key] = clamp((Number(state[key]) || 0) + (Number(choice.effects?.[key]) || 0), 0, ['health', 'sanity', 'fuel'].includes(key) ? 100 : Infinity);
  }
  result.flags = normalizeFlags([...normalizeFlags(state.flags), ...(choice.setFlag ? [choice.setFlag] : [])]);
  if (choice.removeItem) result.inventory = result.inventory.filter(item => item !== choice.removeItem);
  if (choice.item && !result.inventory.includes(choice.item)) result.inventory.push(choice.item);
  return result;
}

export function deriveEnding(state) {
  if (state.health <= 0) return { title: 'The Road Takes Its Due', text: 'Route 13 keeps moving after you stop. Somewhere ahead, the sun rises over the water for someone else.', type: 'death' };
  if (state.sanity <= 0) return { title: 'A Different Kind of Arrival', text: 'The road folds into a thousand roads, and every one of them knows your name. You follow the one that laughs.', type: 'madness' };
  if (state.miles >= 300) {
    if (state.inventory?.includes('tide message')) return { title: 'A Message for the Tide', text: 'At sunrise you tell the sea that its king is sorry. A wave touches your shoes, as gently as an answer.', type: 'special' };
    if (state.sanity < 30) return { title: 'The Uncertain Shore', text: 'The sun rises over the coast. You cannot be sure the ocean is real, but its cold water feels like a beginning.', type: 'bittersweet' };
    if (state.health < 30) return { title: 'Still Here', text: 'Bruised and barely standing, you reach the shore as the sun rises. You sit down in the sand. You made it.', type: 'bittersweet' };
    if (state.cash >= 75) return { title: 'Sunrise, With Change', text: 'You reach the coast with money in your pocket and a horizon nobody can repossess. Breakfast is on you.', type: 'victory' };
    return { title: 'The Coast at Last', text: 'At sunrise, Route 13 ends in salt air and the enormous, ordinary sea. For the first time all night, you know exactly where you are.', type: 'victory' };
  }
  return null;
}

export function validateStory() {
  const errors = [], ids = new Set();
  for (const encounter of encounters) {
    if (ids.has(encounter.id)) errors.push(`Duplicate encounter: ${encounter.id}`);
    ids.add(encounter.id);
    if (!encounter.nodes[encounter.start]) errors.push(`${encounter.id}: missing start`);
    const visited = new Set();
    const visit = nodeId => {
      if (visited.has(nodeId) || !encounter.nodes[nodeId]) return;
      visited.add(nodeId);
      const node = encounter.nodes[nodeId];
      if (!node.text || !Array.isArray(node.choices) || node.choices.length < 3) errors.push(`${encounter.id}/${nodeId}: incomplete beat`);
      for (const choice of node.choices || []) {
        if (!choice.label || !choice.detail || !choice.effects) errors.push(`${encounter.id}/${nodeId}: incomplete choice`);
        if (choice.next !== null && !encounter.nodes[choice.next]) errors.push(`${encounter.id}/${nodeId}: missing node ${choice.next}`);
        else if (choice.next !== null) visit(choice.next);
      }
    };
    visit(encounter.start);
    for (const nodeId of Object.keys(encounter.nodes)) if (!visited.has(nodeId)) errors.push(`${encounter.id}: unreachable node ${nodeId}`);
  }
  return errors;
}
