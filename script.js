document.addEventListener('DOMContentLoaded', () => {
    const MASTER_PROMPT_LIST = [
        "bookshelves inside a cathedral dome",
        "an abandoned castle hallway",
        "the House of Leaves spiral staircase",
        "a lecture hall where all the desks face one empty chair",
        "a courtyard at night, ivy crawling up statutes",
        "a desk covered in papers",
        "a bell tower with no bell",
        "a shadow figure stitched together with handwritten text",
        "a face emerging from darkness, made entirely of negative space",
        "a mirror reflection that does not match the subject",
        "a skull partially obscured by crawling tentacles",
        "an empty chair with something clearly sitting in it",
        "a door cracked open just enough to show an eye staring back",
        "a person whose shadow is doing something different than they are",
        "hands reaching out of a wall like it's made of paper (Yellow-Wallpaper type beat)",
        "a Darkest Dungeon-themed cutscene",
        "a map screen drawn as if it exists physically in the world (think Lethal Company camera)",
        "a candle melting into marble columns",
        "a brain drawn like a floor plan",
        "a stack of books chained together, titles scratched out",
        "a moth trapped inside a lightbulb",
        "a figure wearing a mask made of academic citations",
        "a clock with no numbers—only eyes",
        "a library card catalog filled with human names",
        "draw a room using only straight lines",
        "draw fog using only cross-hatching",
        "draw something beautiful, then “ruin” it with aggressive linework",
        "draw something using one continuous line",
        "start with a symmetrical building, then subtly break the symmetry",
        "a building whose windows are all slightly different sizes",
        "the Five-and-a-Half Minute Hallway",
        "an observatory where the telescope points downward",
        "a city drawn as if it's folding in on itself",
        "a floor plan that looks normal until you rotate the page",
        "a chalkboard covered in equations that resolve into a face",
        "a professor's office where the bookshelves are bricked in",
        "a figure drawn entirely by the space around it",
        "a portrait without eyes",
        "a mouth hidden in the texture of the wall",
        "Adventure Peanut !",
        "BMO and Football having a picnic",
        "a skull with a candle coming out of one of the eyes",
        "doodle page (cute)",
        "doodle page (spooky)",
        "whatever is across from you right now",
        "mini Valorant agents",
        "a dining table with spooky sea creatures on each dish",
        "a teacup with something staring back from inside",
        "an old TV with a face emerging from the static",
        "a bunch of black kittens in a graveyard OR cemetery",
        "a bat bundled up in a scarf",
        "a murder of crows",
        "a car crash from the POV of the driver/passenger sitting inside",
        "a woodland scene - mushrooms, fairies, swampy pond, frogs, lilypads, cottage",
        "a fish bowl but the fish are swimming dice",
        "a poker hand with melting cards",
        "your month your spooky creature",
        "crosses in different art styles / aesthetics",
        "a crying court jester",
        "the Double R diner from Twin Peaks",
        "a village of ghosts living under the ground",
        "a wall at a museum with things that remind you of peanut in each frame",
        "the inside of a bank with all of the clocks showing different time zones",
        "a security camera with something unsettling in the reflection of the lens",
        "ivy growing through stained glass instead of around it",
        "hands emerging from between stacked books",
        "a minimap that shows rooms you haven't entered yet",
        "a museum exhibit with Darkest Dungeon trinkets in each case",
        "a map of nubby's mind",
        "a map of peanut's mind",
        "Monster House reimagined",
        "American Horror Story Hotel reimagined",
        "a bunch of different candles and candelabra",
        "stairs leading into a basement with spooky things crawling out of the shadows",
        "a menu screen embedded into the game environment",
        "Darkest Dungeon stage coach",
        "a lamp illuminating the page of a book with non-normal shadows on the pages",
        "a window placed where it would look directly into another wall with graffiti on it",
        "a castle with a moat around it - tentacles coming out of the moat",
        "cyberpunk body parts",
        "a fountain filled with eyes",
        "the plushies in my room",
        "a scene from Hitman (maybe Berlin)",
        "a scene from Adventure Time",
        "a scene from Regular Show",
        "a candle with the wax melting upward instead of downward",
        "Becca wherever she is sitting at this moment",
        "little pandas having a picnic",
        "two chicks, a bear, and a lion watching a movie (like us, Linda, and Michael)",
        "a scene from Haunted Hotel",
        "a scene from Blue Velvet",
        "a scene from The Grand Budapest Hotel",
        "a scene from Elevator to the Gallows",
        "a Videodrome-type",
        "an aerial view of a hedge maze",
        "doodles inspired by the ones in the Vonnegut books",
        "3 of our Cult of the Lamb followers",
        "your month your Darkest Dungeon trinket",
        "a piano made of bones",
        "a scene from X-Files",
        "a scene from Eraserhead"
    ];

    function getFromStorage(key, defaultValue) { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : defaultValue; }
    function saveToStorage(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
    if (!localStorage.getItem('sketchAvailablePrompts')) { saveToStorage('sketchAvailablePrompts', MASTER_PROMPT_LIST); }

    // --- PROMPT PAGE LOGIC ---
    if (document.getElementById('get-prompt-btn')) {
        const getPromptBtn = document.getElementById('get-prompt-btn');
        const promptText = document.getElementById('prompt-text');
        const typedTextSpan = promptText.querySelector('.typed-text');
        const promptActions = document.getElementById('prompt-actions');
        const putBackBtn = document.getElementById('put-back-btn');
        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('file-input');
        const notesModal = document.getElementById('notes-modal');
        const sketchDateInput = document.getElementById('sketch-date');
        const sketchNotesInput = document.getElementById('sketch-notes');
        const saveLogBtn = document.getElementById('save-log-btn');

        let availablePrompts = getFromStorage('sketchAvailablePrompts', [...MASTER_PROMPT_LIST]);
        let currentPrompt = null;
        let tempImageSrc = null;

        const GLITCH_DURATION = 1500;
        const TYPING_SPEED = 50;

        function typeWriter(text, onComplete) {
            let i = 0;
            typedTextSpan.textContent = '';
            promptText.classList.add('typing');
            const intervalId = setInterval(() => {
                if (i < text.length) {
                    typedTextSpan.textContent += text.charAt(i); i++;
                } else {
                    clearInterval(intervalId);
                    promptText.classList.remove('typing');
                    if (onComplete) onComplete();
                }
            }, TYPING_SPEED);
        }

        function resetScreen() {
            promptText.setAttribute('data-text', 'Awaiting Input...');
            typedTextSpan.textContent = 'Awaiting Input...';
            promptText.classList.remove('typing');
            promptActions.classList.add('hidden');
            getPromptBtn.disabled = false;
            currentPrompt = null;
            tempImageSrc = null;
        }

        function handleGetPrompt() {
            if (availablePrompts.length === 0) {
                alert("PROMPT CACHE EMPTY. REINITIALIZING...");
                availablePrompts = [...MASTER_PROMPT_LIST];
            }
            getPromptBtn.disabled = true;
            promptActions.classList.add('hidden');
            
            // --- THE FIX IS HERE ---
            // 1. Set the SPAN's text to "GENERATING..."
            typedTextSpan.textContent = "GENERATING..."; 
            // 2. Set the PARENT'S data-text attribute for the glitch effect
            promptText.setAttribute('data-text', "GENERATING...");
            // 3. Add the glitch class to the PARENT
            promptText.classList.add('glitching');

            setTimeout(() => {
                promptText.classList.remove('glitching');
                const randomIndex = Math.floor(Math.random() * availablePrompts.length);
                currentPrompt = availablePrompts.splice(randomIndex, 1)[0];
                saveToStorage('sketchAvailablePrompts', availablePrompts);
                
                // Now call the typewriter, which will clear the span and type the new prompt
                typeWriter(currentPrompt, () => {
                    promptActions.classList.remove('hidden');
                });
            }, GLITCH_DURATION);
        }

        function handleFileSelect(event) {
            const file = event.target.files[0];
            if (!file || !currentPrompt) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                tempImageSrc = e.target.result;
                sketchDateInput.value = new Date().toISOString().split('T')[0];
                sketchNotesInput.value = '';
                notesModal.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
            fileInput.value = '';
        }

        function handleSaveLog() {
            if (!currentPrompt || !tempImageSrc) return;
            const newItem = { id: Date.now(), prompt: currentPrompt, imageSrc: tempImageSrc, date: sketchDateInput.value, notes: sketchNotesInput.value };
            let galleryItems = getFromStorage('sketchGallery', []);
            galleryItems.unshift(newItem);
            saveToStorage('sketchGallery', galleryItems);
            alert('LOG SUCCESSFUL. DATA ARCHIVED.');
            notesModal.classList.add('hidden');
            resetScreen();
        }

        getPromptBtn.addEventListener('click', handleGetPrompt);
        putBackBtn.addEventListener('click', () => { if (currentPrompt) { availablePrompts.push(currentPrompt); saveToStorage('sketchAvailablePrompts', availablePrompts); } resetScreen(); });
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
        saveLogBtn.addEventListener('click', handleSaveLog);
        notesModal.addEventListener('click', (e) => { if (e.target === notesModal) notesModal.classList.add('hidden'); });
    }

    // --- GALLERY PAGE LOGIC (Unchanged) ---
    if (document.getElementById('gallery-container')) {
        const galleryContainer = document.getElementById('gallery-container');
        function renderGallery() {
            const galleryItems = getFromStorage('sketchGallery', []);
            galleryContainer.innerHTML = '';
            if (galleryItems.length === 0) { galleryContainer.innerHTML = `<p class="empty-gallery-message">NO DATA LOGS FOUND. INITIATE A PROMPT TO BEGIN.</p>`; return; }
            galleryItems.forEach(item => {
                const card = document.createElement('div');
                card.className = 'gallery-card';
                card.innerHTML = `<div class="card-inner"><div class="card-front"><img src="${item.imageSrc}" alt="Sketch for ${item.prompt}"></div><div class="card-back"><h3>${item.prompt}</h3><p class="date">Logged: ${item.date || 'N/A'}</p><p class="notes">${item.notes || 'No notes available.'}</p><button class="remove-btn" data-id="${item.id}">Remove Log</button></div></div>`;
                galleryContainer.appendChild(card);
            });
        }
        function handleRemoveItem(id) {
             if (!confirm('Are you sure you want to remove this log? This will return the prompt to the mix.')) return;
             let galleryItems = getFromStorage('sketchGallery', []);
             let availablePrompts = getFromStorage('sketchAvailablePrompts', []);
             const itemToRemove = galleryItems.find(item => item.id == id);
             if (itemToRemove) {
                 availablePrompts.push(itemToRemove.prompt);
                 const updatedGallery = galleryItems.filter(item => item.id != id);
                 saveToStorage('sketchAvailablePrompts', availablePrompts);
                 saveToStorage('sketchGallery', updatedGallery);
                 renderGallery();
             }
        }
        galleryContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.gallery-card');
            if (!card) return;
            if (e.target.classList.contains('remove-btn')) {
                const id = e.target.dataset.id;
                handleRemoveItem(id);
            } else {
                card.classList.toggle('flipped');
            }
        });
        renderGallery();
    }
});