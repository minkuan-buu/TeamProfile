document.addEventListener('DOMContentLoaded', () => {

    const folderGrid = document.getElementById('folder-grid');
    const searchInput = document.getElementById('searchActivityInput');

    const noResultMsg = document.getElementById('noResultActivity');

    const modal = document.getElementById('activity-modal');
    const closeModalBtn = document.querySelector('.close-modal');

    const mImgContainer = document.getElementById('modal-img');
    const mName = document.getElementById('modal-name');
    const mDate = document.getElementById('modal-date');
    const mLocation = document.getElementById('modal-location');
    const mPlan = document.getElementById('modal-plan');
    const mComment = document.getElementById('modal-comment');

    const jsonUrl = './activities.json';
    let loadedActivities = [];

    fetch(jsonUrl)
        .then(res => res.json())
        .then(data => {
            loadedActivities = data.activities;

            renderFolders(loadedActivities);

        })
        .catch(err => console.error('Lỗi tải activities:', err));

    function renderFolders(activities) {

        if (activities.length === 0) {
            folderGrid.innerHTML = '';
            noResultMsg.style.display = 'block';
            return;
        }

        const html = activities.map(act => `
            <div class="folder-item" data-id="${act.id}">
                <div class="folder-icon">📁</div>
                <div class="folder-name">${act.name}</div>
                <div class="folder-date">${act.date}</div>

                <span style="display:none">${act.location} ${act.plan}</span>
            </div>
        `).join('');

        folderGrid.innerHTML = html;
        noResultMsg.style.display = 'none';

        addClickEvents(activities);
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const keyword = e.target.value.toLowerCase().trim();
            const allFolders = document.querySelectorAll('.folder-item');
            let hasResult = false;

            allFolders.forEach(folder => {

                const content = folder.textContent.toLowerCase();

                if (content.includes(keyword)) {
                    folder.style.display = 'flex';

                    hasResult = true;
                } else {
                    folder.style.display = 'none';

                }
            });

            if (hasResult) {
                folderGrid.style.display = 'grid';

                noResultMsg.style.display = 'none';
            } else {
                folderGrid.style.display = 'none';

                noResultMsg.style.display = 'block';
            }
        });
    }

    function addClickEvents(activities) {
        const folders = document.querySelectorAll('.folder-item');
        folders.forEach(folder => {
            folder.addEventListener('click', () => {
                const id = folder.getAttribute('data-id');

                const data = loadedActivities.find(item => item.id == id);

                if (data) {
                    fillModal(data);
                    openModal();
                }
            });
        });
    }

    function fillModal(data) {

        const isImage = data.image && (data.image.includes('.') || data.image.includes('/') || data.image.includes('http'));

        mImgContainer.innerHTML = '';

        if (isImage) {
            mImgContainer.innerHTML = `<img src="${data.image}" style="width:100%; height:100%; object-fit:cover; border-radius: 8px;">`;
        } else {
            mImgContainer.innerHTML = `<div style="font-size: 80px; text-align: center;">${data.image || '📁'}<span class="image-comment" style="display: block; font-size: 18px; color: gray;">Upcoming...</span></div>`;
        }

        mName.innerText = data.name;
        mDate.innerText = data.date;
        mLocation.innerText = data.location;
        mPlan.innerText = data.plan;
        mComment.innerText = data.comment;
    }

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});