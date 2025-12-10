document.addEventListener('DOMContentLoaded', () => {
    const memoryGrid = document.getElementById('memory-grid');
    const overlay = document.getElementById('overlay');
    const jsonUrl = './memories.json';

    let activeClone = null;
    let activeOriginal = null;
    let savedRotation = '';

    function getRandomRotation() {
        return Math.floor(Math.random() * 7) - 3;
    }

    fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            memoryGrid.innerHTML = data.memories.map(memory => `
                <div class="polaroid-item" style="transform: rotate(${getRandomRotation()}deg);">
                    <div class="tape"></div>
                    <div class="photo-box">
                        <img src="${memory.image}" alt="${memory.alt}">
                    </div>
                    <div class="caption">${memory.caption}</div>
                </div>
            `).join('');
        });

    memoryGrid.addEventListener('click', (e) => {
        const item = e.target.closest('.polaroid-item');
        if (!item || activeClone) return;

        activeOriginal = item;
        savedRotation = item.style.transform;
        const rect = item.getBoundingClientRect();

        activeClone = item.cloneNode(true);
        activeClone.classList.add('polaroid-clone');

        activeClone.style.margin = '0';

        activeClone.style.top = `${rect.top}px`;
        activeClone.style.left = `${rect.left}px`;
        activeClone.style.width = `${rect.width}px`;
        activeClone.style.height = `${rect.height}px`;
        activeClone.style.transform = `${savedRotation} scale(1)`;

        document.body.appendChild(activeClone);

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const targetTop = (viewportHeight - rect.height) / 2;
        const targetLeft = (viewportWidth - rect.width) / 2;

        requestAnimationFrame(() => {
            item.classList.add('hidden-placeholder');
            overlay.classList.add('active');

            setTimeout(() => {
                activeClone.classList.add('zoomed');
                activeClone.style.top = `${targetTop}px`;
                activeClone.style.left = `${targetLeft}px`;
                activeClone.style.transform = 'rotate(0deg) scale(1.5)';
            }, 10);
        });
    });

    function closeZoom() {
        if (!activeClone || !activeOriginal) return;

        activeClone.classList.remove('zoomed');
        overlay.classList.remove('active');

        const rect = activeOriginal.getBoundingClientRect();

        activeClone.style.top = `${rect.top}px`;
        activeClone.style.left = `${rect.left}px`;

        activeClone.style.width = `${rect.width}px`;
        activeClone.style.height = `${rect.height}px`;

        activeClone.style.transform = `${savedRotation} scale(0.88)`;

        setTimeout(() => {
            if (activeOriginal) activeOriginal.classList.remove('hidden-placeholder');
            if (activeClone) activeClone.remove();
            activeClone = null;
            activeOriginal = null;
        }, 500);
    }

    overlay.addEventListener('click', closeZoom);
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('polaroid-clone')) {
            closeZoom();
        }
    });
});