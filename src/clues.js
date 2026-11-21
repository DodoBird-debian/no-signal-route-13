// Observations are available from the shoulder, before accepting a ride.
// Each triplet describes the driver, plate area, and visible cargo respectively.
const clues = {
 saucer:['A practiced smile sits oddly on the driver’s face; its eyes keep turning upward.','The unmarked sedan’s plate catches a cold silver reflection.','A small instrument case rests behind the front seats.'],
 contraband:['Mara watches the road while a tired ice-cream jingle plays.','The truck’s plate sits beneath a streak of melted paint.','Sealed wooden crates crowd the back of the ice-cream truck.'],
 raccoon:['A raccoon in a tiny deputy hat grips the cruiser’s wheel.','The county cruiser’s plate is framed by dusty bumper trim.','A covered crate in back gives a quiet whimper.'],
 crossfire:['June keeps her eyes on the mirrors, her expression remarkably calm.','The sedan’s plate sits below a battered rear bumper.','An envelope lies on the passenger seat beneath scattered glass.'],
 deep:['An immense figure folds itself behind the wheel of the wet-stone hearse.','Water runs over the hearse’s plate and drips onto the road.','Seawater pools around a closed compartment behind the driver.'],
 fox:['One fox woman winks while the other checks the mirrors.','The convertible’s plate flashes in the red glow of its tail lamps.','A folded map lies between two battered travel documents.'],
 witch:['A woman in a moth-eaten veil holds a receipt out of the window.','The station wagon’s plate peeks out beneath a fringe of road dust.','Little glass jars line the dashboard, their contents shifting like weather.'],
 ambulance:['Nurse Bell leans across the silent ambulance and offers a reassuring nod.','The ambulance plate sits under a row of unlit emergency lamps.','A red light blinks softly from the patient compartment.'],
 radio:['DJ Static taps a rhythm on the wheel as an old song plays.','The radio van’s plate vibrates gently with the bass.','Record sleeves and broadcast equipment are visible through the rear window.'],
 wedding:['A bride in muddy boots leans out of the limousine window.','The white limousine’s plate is bordered by a trailing ribbon.','A bouquet and a scattering of wedding favors occupy the back seat.'],
 taxi:['Mr. Meter gestures toward the empty passenger seat with practiced courtesy.','The taxi’s plate sits below its well-used yellow bumper.','A meter is already ticking beside a stack of fare receipts.'],
 mushroom:['Fenn, a raccoon in a cardigan, beckons from the bus doorway.','The mossy bus’s plate is partly surrounded by greenery.','Mushrooms sway together in the bus, producing a faint low harmony.'],
 chef:['Chef Claude leans out in a stained apron, watching the road.','The food truck’s plate sits below a grease-speckled bumper.','Covered serving trays and cooking utensils crowd the truck.'],
 clone:['The driver has your face, better posture, and a distinctly worse haircut.','The blue hatchback’s plate sits in an ordinary-looking holder.','A packed glove box presses slightly against its latch.'],
 shark:['A shark watches you through aquarium glass near the controls.','The pickup’s plate is low beneath a tank secured with straps.','Water sloshes inside the strapped-down aquarium; a pump hums.'],
 ghost:['Elise’s transparent hands rest on the coupe’s wheel.','The vintage coupe’s plate rests in an old-fashioned metal frame.','An old radio glows on the dashboard, murmuring a weather report.'],
 circus:['Mister Jest’s painted smile contrasts with his tired eyes.','The striped caravan’s plate hangs beneath a row of little bells.','Costumes and empty folding chairs are stacked inside the caravan.'],
 lighthouse:['Ada North wears the practical clothes of someone accustomed to long shifts outdoors.','The maintenance truck’s plate sits beneath a working light.','A huge replacement bulb is secured in the truck bed.'],
 schoolbus:['Miss Chalk waits at the wheel beneath the bus’s dim interior lights.','The yellow bus’s plate sits below a wide, worn bumper.','Pale children sit quietly behind the windows, papers in their hands.'],
 loop:['Nina watches you with the patient expression of someone expecting a familiar question.','The checkered cab’s plate seems to flicker as the headlights settle.','A road map is folded and refolded beside the meter.'],
 siren:['The ambulance’s driver seat is empty; its dashboard glows invitingly.','The ambulance plate is mounted beneath a silent siren housing.','Medical equipment is visible through the patient-compartment window.'],
 band:['Maestro Graves raises a hand over the wheel as though conducting.','The parade float’s plate is framed by dark funeral trim.','Brass instruments glint below an empty coffin strapped to the roof.'],
 diner:['Dot watches from behind the wheel with a cook’s brisk attention.','The chrome diner’s plate reflects the passing road lights.','Through the window, tables hang overhead while coffee stays in its cups.'],
 weather:['Sol Cloud waves from a van covered in umbrellas.','The van’s plate is sheltered beneath a dripping umbrella edge.','Glass bottles are packed in rows; one has a dusting of snow around it.'],
 jury:['A mannequin in a judge’s wig turns toward you without blinking.','The limousine’s plate rests beneath its long polished trunk.','A dozen mannequin faces are visible through the long windows.'],
 bloodbank:['Dr. Sable wears sunglasses despite the dark.','The blood-bank van’s plate sits below a clean rear door.','Carefully labeled coolers fill the back of the van.'],
 moonrepo:['Lena Hook checks a heavy chain with the confidence of a tow operator.','The tow truck’s plate hangs below its towing gear.','A silver chain runs from the truck up into the night sky.'],
 cake:['Madame Crumb drives with a solemn, steady grip.','The hearse’s plate is bordered by dark funeral trim.','A wedding cake beneath a black veil rides in the hearse.'],
 snail:['Professor Shell peers ahead from a caravan drawn by an enormous snail.','The caravan’s plate moves slowly past the on-ramp marker.','Racing papers and a small clock are visible inside the caravan.'],
 moonradio:['DJ Undertow adjusts a headset as a voice crackles from the van.','The pirate van’s plate sits beneath its broadcast equipment.','A microphone and transmitter glow inside; the sky above is moonless.'],
 kaiju:['Adjuster Pike offers a clipboard through the truck window.','The inspection truck’s plate is flecked with road dust.','Forms and measuring equipment are piled in the cab beside enormous footprints.'],
 dragonlibrary:['Librarian Ash watches the shelves with a protective eye.','The library bus’s plate sits beneath a row of book-themed trim.','A small dragon peers between the shelves of books.'],
 whalecourt:['Judge Baleen waits at the wheel of the whale-shaped bus.','The bus’s plate trembles slightly with a deep rhythmic pulse.','The aisle flexes behind the windows as something large breathes.'],
 pageant:['Velour Vane sits upright at the wheel in a carefully arranged outfit.','The velvet limousine’s plate sits beneath a dark drape.','Taxidermy contestants wear sequined sashes in the rear seats.'],
 blacktoll:['Tollkeeper Null has a ledger open beside the steering wheel.','The black service van’s plate catches very little light.','A pile of paperwork and a toll attendant’s equipment occupy the van.'],
 gpsdream:['Mina glances between the road and a softly murmuring navigation screen.','The taxi’s plate is mounted beneath its rear bumper.','A GPS screen glows on the dashboard, speaking directions in its sleep.'],
 carwash:['Sister Suds watches you from a van dripping with foam.','The van’s plate is bordered by a collar of slowly sliding suds.','Hoses, cleaning supplies, and damp cloths fill the back.'],
 birthdayhearse:['Morrow steers the reversing hearse with practiced concentration.','The hearse’s plate approaches you before the driver does.','Cake boxes sit secured behind the glass.'],
 octoconductor:['An octopus in a conductor’s coat directs traffic from the wheel.','The orchestra bus’s plate vibrates with a low musical hum.','Instrument cases and sheet music fill the bus.'],
 vending:['A vending machine sits at the taxi’s controls; its display asks for a destination.','The taxi’s plate sits below a square, brightly lit rear window.','Snack packages show through the machine’s glass, and a tiny key jams its coin slot.'],
 lobsterstars:['A lobster in a lab coat peers over the pickup’s steering wheel.','The pickup’s plate sits below a rack of observing equipment.','A telescope is strapped securely in the truck bed.'],
 gnomeparole:['Warden Moss watches the back of the garden van in the mirror.','The garden van’s plate sits beneath a dusting of potting soil.','Small painted faces peer through the rear windows beside flowerpots.'],
 shadowpawn:['Penny Shade studies you from the window of a box truck.','The pawnshop truck’s plate lies in the shadow of its wide rear doors.','Framed silhouettes crowd the truck’s windows.'],
 lostandfound:['A pale clerk watches the shoulder from behind the wheel.','The van’s plate sits beneath a row of dangling claim tags.','Tagged umbrellas, gloves, and keys fill the windows.'],
 antlimo:['A neat trail of ants crosses the limousine window near the driver’s controls.','The limousine’s plate is framed by a narrow strip of road dust.','A map envelope and tiny parcels sit inside the long cabin.'],
 tomorrowcrew:['Foreman Tick signals from a slow-moving road crew truck.','The truck’s plate flashes beneath blinking warning lights.','A roller, warning signs, and a clock ride with the paving equipment.']
};

const kinds = ['window', 'plate', 'cargo'];
const labels = ['Study the driver', 'Read the plate', 'Check the cargo'];
const titles = ['At the window', 'At the plate', 'In the cargo'];
export function getExteriorObjects(encounter) {
  const texts = clues[encounter?.id];
  return texts ? kinds.map((kind, index) => ({ id: kind, kind, label: labels[index], title: titles[index], text: texts[index] })) : [];
}
