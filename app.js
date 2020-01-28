const elements = document.querySelectorAll("[app-lang]");
const graveForm = document.querySelector('.grave-form');
const graveRows = document.querySelector('#graveRows');
const gravesNumber = document.querySelector('#gravesNumber');
const results = document.querySelector('#results');
results.setAttribute('style', 'display:none');

let filteredGraves;


let currentLanguage = localStorage.getItem('language');
if (!currentLanguage) {
    currentLanguage = "PL";
}

let lastNumberFound = 0;

const setGravesNumberText = number => {
    let text = GetTextById('gravesFound');
    text = text.replace('{0}', number);
    gravesNumber.textContent = text;
}

const getTranslations = async () => {
    const response = await fetch('./data/translations.json');
    const data = await response.json();
    return data;

};

const getGraves = async () => {
    const response = await fetch('./data/graves.json');
    const data = await response.json();
    return data;
};



let texts;
getTranslations().then(data => {
    texts = data;
    changeTranslations();
});

let graves;
getGraves().then(data => {
    graves = data;
});

function changeLanguage() {
    currentLanguage = currentLanguage === "PL" ? "EN" : "PL";
    localStorage.setItem('language', currentLanguage);
    changeTranslations();
}

function GetTextById(textId) {
    const text = texts.find(
        lang => lang.lang === currentLanguage
    ).translations[textId];

    return text;
}

function changeTranslations() {

    let textId;
    elements.forEach(item => {
        textId = item.getAttribute("app-lang");
        const text = GetTextById(textId);

        if (item.nodeName === 'INPUT') {
            item.setAttribute("placeholder", text);
        } else {
            item.textContent = text;
        }

    });

    setGravesNumberText(lastNumberFound);
}

const searchHandler = () => {
   
    if (graves) {
        filteredGraves = graves.filter(grave => {
            if (!grave.Surname) {
                grave.Surname = '';
            }
            if (!grave.Givenname) {
                grave.Givenname = '';
            }

            const result = grave.Surname.toLowerCase().indexOf(graveForm.lastName.value.toLowerCase()) > -1 && grave.Givenname.toLowerCase().indexOf(graveForm.firstName.value.toLowerCase()) > -1;
            return result;
        });

        if (filteredGraves) {
            graveRows.innerHTML = '';
            let innerHTML = '';
            filteredGraves.forEach(grave => {
                const row = `<tr class='graveRow' data-id='${grave.Id}'>
                                <td>${grave.Surname ? grave.Surname : ''}</td>
                                <td>${grave.Givenname ? grave.Givenname : ''}</td>
                                <td>${grave.DateDied ? grave.DateDied : ''}</td>
                                <td class="bigscreen">${grave.Age ? grave.Age : ''}</td></tr>`;
                innerHTML += row;
            });
            graveRows.innerHTML = innerHTML;
        };
    }

    const number = filteredGraves ? filteredGraves.length : 0;
    setGravesNumberText(number);
    lastNumberFound = number;

    results.setAttribute('style', 'display:block');
    results.scrollIntoView();

}

graveForm.addEventListener('submit', e => {
    e.preventDefault();
    graveForm.submitButton.disabled = true;
    searchHandler();

});

const isFormEmpty = () => {
    const disabled = !Array.from(graveForm.elements).filter(x => x.type === 'text').some(x => x.value);
    return disabled;
}


graveForm.addEventListener('keyup', e => {
    graveForm.submitButton.disabled = isFormEmpty();
});

graveForm.addEventListener('paste', e => {
    let paste = (e.clipboardData || window.clipboardData).getData('text');
    if(paste){
        graveForm.submitButton.disabled =false;
    }
});

graveForm.addEventListener('reset', e => {
    graveForm.submitButton.disabled = true;
    graveRows.innerHTML = '';
    results.setAttribute('style', 'display:none');

});


graveRows.addEventListener('click', e => {
    if (e.target.tagName === 'TD') {
        const currentRow = e.target.parentElement;

        if (currentRow.classList.contains('details')) {
            currentRow.classList.remove('details');
            currentRow.parentNode.removeChild(currentRow.nextElementSibling);

        } else {

            if (!currentRow.classList.contains('details') && !currentRow.classList.contains('graveCardRow')) {
                const detailRow = document.querySelector('.details');
                if (detailRow) {
                    detailRow.classList.remove('details');
                    detailRow.parentNode.removeChild(detailRow.nextElementSibling);
                }
                const dataId = currentRow.getAttribute('data-id');
                const graveData = filteredGraves.find(grave=>grave.Id==dataId);

                console.log(graveData);
                currentRow.classList.add('details');

                currentRow.insertAdjacentHTML('afterend',
                    `<tr class="graveCardRow">
                        <td colspan="4">
                        <div class="flexWraper">
                        <img src='${graveData.Image}' class='cardPicture'>
                        <div class="cardInformation">
                            <h1>${(graveData.Givenname ||'') + ' ' +  (graveData.Surname ||'')}</h1>
                            <p><span class='cardLabel'>Hebrew date of death: </span><span>${graveData.HebrewDate ||''}</span></p>
                            <p><span>Age: </span><span>${graveData.Age ||''}</span></p>
                            <p><span>Spouse name: </span><span>${graveData.Spouse ||''}</span></p>
                            <p><span>Father's name: </span><span>${graveData.Father ||''}</span></p>
                            <p><span>Notes: </span><span>${graveData.Comments ||''}</span></p>
                            <p><span>Reference: </span><span>${graveData.Reference ||''}</span></p>
                            <p><span>Row: </span><span>${graveData.Row ||''}</span></p>

                        </div>
                        </div>
                    </td>
                    </tr>`);

            }
        }
    }
    // let details = document.createElement("tr");
    //details.innerHTML+="<div> jest ejst jest </div>";

    //graveRows.insertBefore(e.target.parentElement.nextElementSibling, details);


});


//Array.from(graveForm.elements).filter(x=>x.type==='text').foreach