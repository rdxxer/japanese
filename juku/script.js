function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('juku.csv')
        .then(response => response.text())
        .then(data => {
            const lines = data.trim().split('\n')
            window.quizData = lines.map(line => {
                const [reading, kanji] = line.split(',')
                return { kanji: kanji.trim(), reading: reading.trim() }
            })
            shuffleArray(quizData)
            window.currentPage = 0
            window.pageSize = 30
            window.userAnswers = {};
            window.prevAnswers = {};
            renderPage()
        })
        .catch(error => console.error('エラー:', error))
})

function renderPage() {
    const container = document.querySelector('.container')
    const table = document.querySelector('.table')
    table.innerHTML = ''
    
  
    const start = currentPage * pageSize
    const end = Math.min(start + pageSize, quizData.length)
  
    for (let i = start; i < end; i++) {
        const qDiv = document.createElement('div')
        const kanji = quizData[i].kanji
        qDiv.className = 'kanji'
        qDiv.textContent = kanji

        const aDiv = document.createElement('div')
        aDiv.className = 'reading'

        const input = document.createElement('input')
        input.type = 'text'
        input.value = userAnswers[kanji] || ''
        input.addEventListener('blur', e => {
            const conv = romajiConv(input.value).toHiragana().trim()
            input.value = conv
            if (conv.length == 0) delete userAnswers[kanji]
            else userAnswers[kanji] = conv
        })
        input.addEventListener('focus', () => {
            aDiv.previousElementSibling.classList.add('focused')
        })
        input.addEventListener('blur', () => {
            aDiv.previousElementSibling.classList.remove('focused')
        })
        if (kanji in prevAnswers) {
            if (prevAnswers[kanji] == quizData[i].reading) {
                input.className = 'ac'
                input.readOnly = true
            }
            else input.className = 'wa'
        }
        aDiv.appendChild(input)

        table.appendChild(qDiv)
        table.appendChild(aDiv)
    }
    
    let pagination = document.querySelector('.pagination');
    if (pagination) pagination.remove();

    pagination = document.createElement('div')
    pagination.className = 'pagination'
    
    if (currentPage < Math.ceil(quizData.length / pageSize) - 1) {
        const nextBtn = document.createElement('button')
        nextBtn.textContent = '次へ'
        nextBtn.addEventListener('click', () => {
            currentPage++
            renderPage()
        })
        pagination.appendChild(nextBtn)
    } else {
        const submitBtn = document.createElement('button')
        submitBtn.textContent = '完了'
        submitBtn.addEventListener('click', checkAnswers)
        pagination.appendChild(submitBtn)
    }
    
    container.appendChild(pagination)
}

function checkAnswers() {
    prevAnswers = userAnswers
    let ac = true
    for (let i = 0; i < quizData.length; i++) {
        if (!(quizData[i].kanji in prevAnswers) || quizData[i].reading != prevAnswers[quizData[i].kanji]) {
            ac = false
        }
    }
    if (ac) {
        alert("全問正解")
    }
    currentPage = 0
    renderPage()
}
  