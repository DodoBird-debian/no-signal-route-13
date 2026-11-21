# NO SIGNAL — Route 13

A surreal hitchhiking adventure: choose a stranger's car, survive a branching story, and make it 300 miles to Blackwater Coast.

## Play locally

Requires Node.js 20.19+ or 22+.

```sh
npm ci
npm run dev
```

Open the Local URL Vite prints. Build a standalone static release with `npm run build`; preview it with `npm run preview`.

## Features

- A first-person Three.js highway with a visible passenger cabin, ten vehicle silhouettes, twenty-two animated PNG driver portraits, and a gently movable camera.
- 46 strange encounters: alien abduction, contraband checkpoints, accidental animal kidnapping, gang crossfire, a Cthulhu attack, a fox wedding invitation, ghosts, time loops, and more.
- Thirty-three encounters with distinct branching scenes; the twenty-two newest stories each have four beats. Choices change body, nerve, cash, distance, and inventory; items unlock further choices.
- Cars approach along the road before stopping. Inspect the driver, plate, and cargo before boarding: 138 authored clues persist in the journal even when you pass.
- Act directly through 3D story props: 14 actions across nine encounters use a flare, scanner, radio, or envelope to make a real branching choice.
- Inspect real 3D cabin objects: radio, glovebox, folded map, and mirror charm. Discoveries persist, appear in the journal, and can unlock combat or escape options.
- Cabin actions trigger brief 3D effects or static highlights when scenery motion is off.
- Gentle visual reactions to damage, rewards, gunfire, aliens, and eldritch events; motion respects reduced-motion settings.
- Story-driven 3D staging: a tractor-beam lift, enclosed alien hangar, pursuing vehicles, tunnels, checkpoints, and storms. Resolved beats remove their threats.
- Lasting trip consequences connect three pairs of encounters. Earlier decisions unlock later dialogue; eligible callback drivers approach next unless you recently declined them. The journal records what follows you.
- A low-poly forest corridor, neon roadside buildings, and an eldritch shoreline give different rides distinct surroundings.
- Per-driver trust on authored choices, persisted with the trip. Helpful choices can unlock an optional route; the badge and journal show when trust changes.
- Revisit discovered drivers from the road atlas to start a new trip with a chosen encounter.
- Multiple coast endings and two failure conditions. Arrival waits for the final scene of the current ride.
- Automatic browser-local saves, resume, travel journal, a persistent discovery atlas, usable food/first-aid supplies, keyboard controls, reduced motion, and optional synthesized audio.
- Responsive interface, locally bundled fonts, and an atmospheric canvas fallback when WebGL cannot initialize.

## Controls

Drag the 3D scene or use the **arrow keys** to look around (limited to 12° horizontally and 6° vertically). Press **L**, or choose **Look around**, to tuck away the story panel; use **Return to story** to continue. On narrow screens, the camera controls include direction buttons. Look down at the dashboard and click glowing object labels to inspect them. Press **I**, or use the backpack icon beside the camera controls, for an accessible object list, both outside a waiting car and inside the cabin. Roadside decisions remain available while looking around.

Choose **Act in the scene** when available, then click the glowing action label above the relevant prop. This makes the matching story choice and shows the outcome in the cabin. Select **Continue the story** to return to the dialogue. The **I** list includes these actions alongside cabin discoveries.

Use the buttons, or press **1–4** for choices, **J** for the journal, **M** for sound, and **Escape** to close a dialog. On the roadside, **1** passes and **2** accepts a ride. There are no timed choices.

Sound starts muted. Open Settings to toggle audio or motion. The current trip saves on this device; starting a new trip replaces that save. The road atlas preserves discovered drivers and endings across trips, and new trips prefer an undiscovered opening ride. Use consumable supplies from the backpack when injured; they disappear after use.

## Validation

`npm test` runs 49 checks covering encounter graphs, real cross-ride item acquisition, affordable choices, state bounds, immutability, complete trips, ending timing, save normalization, supplies, persistent discoveries, shipped portraits, camera input limits, persistent cabin discoveries, story routes unlocked by real inspection rewards, driver trust, narrative-to-renderer staging, saved cross-ride consequences, callback offer selection, physical action identity, gates, and stale-click rejection. `npm run build` produces `dist/`.

Manual browser verification covered the title, ride selection, restored saves, UFO escape, a complete coast run, the new stolen-moon ride, completion screen, backpack, journal, atlas migration, and desktop/narrow-screen layouts. Camera buttons, keyboard look, mouse drag, scene/story switching, and look with ambient motion disabled were exercised in the actual first-person view. Browser QA also verified clicking the 3D map and glovebox, saved inspection progress after reload, full discovery text in the journal, mobile object labels, and finding then using the tire iron in the Cthulhu fight. The staged alien lift/hangar/return, atlas replay, trust-locked and trust-unlocked routes, reload persistence, and mobile trust layout were also checked in the browser. The roadside pass also verified approaching cars, exterior hotspots, declining while scouting, early boarding, replay arrivals, mobile note layout, and save restoration without duplicate observations or resource changes. The consequence pass manually played the council-to-radio callback across a reload, checked its unlocked and excluded choices, verified the mobile consequence journal, and viewed the forest, neon, and eldritch environments. All three authored callbacks have automated integration coverage. Physical-action QA clicked the flare, envelope, radio, and scanner controls in the rendered cabin; it checked saved flare state after reload, mobile flare consumption, two separate scanner controls on mobile, and the I-list action fallback. Additional story and session paths are covered by automated tests; these are not a claim that every path has been manually played.

## Assets and content

Original character portraits were generated for this project, then resized with transparent edges preserved. Fonts are Barlow Condensed and DM Sans from Google Fonts, distributed under the bundled OFL licenses. Road geometry and audio are generated by the game. No remote image or font services are required at runtime.

Surreal horror, fictional crime and cartoon peril, plus non-explicit adult flirtation. All romantic characters are adults.
