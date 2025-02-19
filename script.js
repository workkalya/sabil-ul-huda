 // JavaScript will be added here
 let currentAudio = null;  // To manage audio playback
 let ayats = [];  // Store ayat data for navigation
 
 document.addEventListener('DOMContentLoaded', function() {
     fetch('https://api.alquran.cloud/v1/surah')
         .then(response => response.json())
         .then(data => {
             let surahList = document.getElementById('surahList');
             if (data.data) {
                 data.data.forEach(surah => {
                     let surahDiv = document.createElement('div');
                     surahDiv.className = 'surah';
                     surahDiv.textContent = `${surah.number}. ${surah.name}`;
                     surahDiv.dataset.number = surah.number;
                     surahDiv.addEventListener('click', function() {
                         showAyats(this.dataset.number);
                     });
                     surahList.appendChild(surahDiv);
                 });
             } else {
                 console.error('No surah data found');
             }
         })
         .catch(error => console.error('Error fetching surahs:', error));
 
     function showAyats(surahNumber) {
         document.getElementById('surahList').style.display = 'none';
         document.getElementById('ayahList').style.display = 'block';
         ayats = [];  // Reset ayats array
 
         fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`)
             .then(response => response.json())
             .then(data => {
                 if (data.data && data.data.ayahs) {
                     let ayahList = document.getElementById('ayahList');
                     ayahList.innerHTML = ''; // Clear previous content
 
                     // Navigation Buttons
                     let navButtons = document.createElement('div');
                     navButtons.innerHTML = `
                         <button class="navigation-button" data-direction="prev">Previous Surah</button>
                         <button class="navigation-button" data-direction="next">Next Surah</button>
                     `;
                     navButtons.querySelectorAll('.navigation-button').forEach(button => {
                         button.addEventListener('click', function() {
                             let newSurahNumber = parseInt(surahNumber) + (this.dataset.direction === 'next' ? 1 : -1);
                             if (newSurahNumber > 0 && newSurahNumber <= 114) { // 114 is the total number of surahs
                                 showAyats(newSurahNumber);
                             }
                         });
                     });
                     ayahList.appendChild(navButtons);
 
                     // Back button
                     let backButton = document.createElement('a');
                     backButton.href = '#';
                     backButton.className = 'back-button';
                     backButton.textContent = 'Back to Surahs';
                     backButton.addEventListener('click', function(e) {
                         e.preventDefault();
                         document.getElementById('surahList').style.display = 'block';
                         document.getElementById('ayahList').style.display = 'none';
                         if (currentAudio) {
                             currentAudio.pause();
                             currentAudio = null;
                         }
                     });
                     ayahList.appendChild(backButton);
 
                     data.data.ayahs.forEach(ayah => {
                         let ayahDiv = document.createElement('div');
                         ayahDiv.className = 'ayah';
                         ayahDiv.textContent = `${ayah.numberInSurah}. ${ayah.text}`;
                         ayahDiv.dataset.number = ayah.number;
                         
                         ayahDiv.addEventListener('click', function() {
                             playAudio(this.dataset.number, this);
                         });
                         ayats.push({ div: ayahDiv, number: ayah.number });
                         ayahList.appendChild(ayahDiv);
                     });
                 } else {
                     console.error('No ayah data found for surah:', surahNumber);
                 }
             })
             .catch(error => console.error('Error fetching ayats:', error));
     }
 
     function playAudio(ayahNumber, ayahDiv) {
         if (currentAudio) {
             currentAudio.pause();
         }
 
         fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/ar.alafasy`)
             .then(response => response.json())
             .then(data => {
                 if (data.data && data.data.audio) {
                     currentAudio = new Audio(data.data.audio);
                     currentAudio.play();
 
                     // Highlight the current ayah
                     ayats.forEach(a => a.div.classList.remove('playing'));
                     ayahDiv.classList.add('playing');
 
                     // Play next ayah when audio ends
                     currentAudio.onended = () => {
                         let currentIndex = ayats.findIndex(a => a.number === parseInt(ayahNumber));
                         if (currentIndex < ayats.length - 1) {
                             playAudio(ayats[currentIndex + 1].number, ayats[currentIndex + 1].div);
                         } else {
                             ayahDiv.classList.remove('playing');
                         }
                     };
 
                     // Stop playing when returning to surah list
                     document.querySelector('.back-button').addEventListener('click', function() {
                         if (currentAudio) {
                             currentAudio.pause();
                             currentAudio.onended = null; // Remove the event listener
                             currentAudio = null;
                             ayahDiv.classList.remove('playing');
                         }
                     }, { once: true });
                 } else {
                     console.error('No audio data for ayah:', ayahNumber);
                 }
             })
             .catch(error => console.error('Error fetching audio:', error));
     }
 });