const membersGrid = document.getElementById('membersGrid');
const searchInput = document.getElementById('searchInput');
const noResultMsg = document.getElementById('noResult');

const modal = document.getElementById('memberModal');
const closeBtn = document.querySelector('.close-btn');
const modalAvatar = document.getElementById('modalAvatar');
const modalName = document.getElementById('modalName');
const modalRole = document.getElementById('modalRole');
const modalDob = document.getElementById('modalDob');
const modalHobbiesList = document.getElementById('modalHobbiesList');
const modalDescription = document.getElementById('modalDescription');
const modalContact = document.getElementById('modalContact');

let loadedMembersData = [];

async function loadMembers() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        loadedMembersData = data.members;

        renderMembers(loadedMembersData);
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        membersGrid.innerHTML = '<p style="text-align:center; width:100%">Không tải được dữ liệu thành viên :(</p>';
    }
}

function renderMembers(members) {
    membersGrid.innerHTML = '';

    members.forEach((member, index) => {

        let descriptionHtml = "Chưa có mô tả...";
        if (member['short-description'] && member['short-description'].length > 0) {
            descriptionHtml = member['short-description']
                .map(line => `<div>${line}</div>`)
                .join('');
        }

        const isImage = member.avatar.includes('.') || member.avatar.includes('/') || member.avatar.includes('http');

        let avatarContent = '';
        if (isImage) {

            avatarContent = `<img src="${member.avatar}" alt="${member.name}">`;
        } else {

            avatarContent = member.avatar;
        }

        const cardHtml = `
            <div class="member-card" data-index="${index}">
                <div class="avatar-placeholder">${avatarContent}</div>

                <div class="member-name">${member.name}</div>
                <div class="member-role">${member.role}</div>

                <div class="card-short-preview">
                    ${descriptionHtml}
                </div>

                <div class="member-contact">
                   <span style="display:none">${member.contact.instagram || member.contact.facebook || ""}</span>
                </div>
            </div>
        `;
        membersGrid.innerHTML += cardHtml;
    });

    attachClickEventToCards();
}

function attachClickEventToCards() {
    const cards = document.querySelectorAll('.member-card');
    cards.forEach(card => {
        card.addEventListener('click', function () {
            const index = this.getAttribute('data-index');

            openModal(index);

        });
    });
}

function openModal(index) {
    const member = loadedMembersData[index];

    const isImage = member.avatar.includes('.') || member.avatar.includes('/') || member.avatar.includes('http');

    if (isImage) {

        modalAvatar.textContent = '';
        modalAvatar.innerHTML = `<img src="${member.avatar}" style="width:100%; height:100%; object-fit:cover;">`;
    } else {

        modalAvatar.innerHTML = '';

        modalAvatar.textContent = member.avatar;
    }
    modalName.textContent = member.name;
    modalRole.textContent = member.role;
    modalDob.textContent = member.dateofbirth;

    modalHobbiesList.innerHTML = member.hobbies.map(hobby => `<li>${hobby}</li>`).join('');

    modalDescription.innerHTML = member['short-description'].map(desc => `<p>${desc}</p>`).join('');

    let contactHtml = '';

    if (member.contact.instagram) {
        contactHtml = `<div><a href="https://instagram.com/${member.contact.instagram}" target="_blank">📸 IG: ${member.contact.instagram}</a></div>`;
    } else if (member.contact.facebook) {

        let fbDisplayName = "Facebook";

        try {
            const url = member.contact.facebook;

            const match = url.match(/facebook\.com\/([^\/\?]+)/);

            if (match && match[1]) {
                fbDisplayName = match[1];
            }
        } catch (e) {
            console.error("Lỗi xử lý link Facebook", e);
        }

        contactHtml = `<div><a href="${member.contact.facebook}" target="_blank">📘 FB: ${fbDisplayName}</a></div>`;
    }

    modalContact.innerHTML = contactHtml;

    modal.style.display = 'flex';
}

closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', function (e) {
    if (e.target === modal) {

        closeModal();
    }
});

function closeModal() {
    modal.style.display = 'none';
}

searchInput.addEventListener('keyup', function (e) {
    const keyword = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.member-card');
    let hasResult = false;

    cards.forEach((card, index) => {

        const memberData = loadedMembersData[index];

        const name = memberData.name.toLowerCase();

        const hobbies = memberData.hobbies.join(' ').toLowerCase();
        const description = memberData['short-description'].join(' ').toLowerCase();

        let contactInfo = "";
        if (memberData.contact.instagram) {
            contactInfo = memberData.contact.instagram.toLowerCase();
        } else if (memberData.contact.facebook) {
            const url = memberData.contact.facebook;
            const match = url.match(/facebook\.com\/([^\/\?]+)/);
            if (match && match[1]) contactInfo = match[1].toLowerCase();
        }

        if (name.includes(keyword) ||
            hobbies.includes(keyword) ||
            description.includes(keyword) ||
            contactInfo.includes(keyword)) {

            card.style.display = 'flex';
            hasResult = true;
        } else {
            card.style.display = 'none';
        }
    });

    if (hasResult) {
        membersGrid.style.padding = '40px';
        noResultMsg.style.display = 'none';
    } else {
        membersGrid.style.padding = '0';
        noResultMsg.style.display = 'block';
    }
});

const themeToggleBtn = document.getElementById('themeToggle');
const bodyElement = document.body;

const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
    bodyElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '🌙';

}

themeToggleBtn.addEventListener('click', function () {

    const currentTheme = bodyElement.getAttribute('data-theme');

    if (currentTheme === 'dark') {

        bodyElement.removeAttribute('data-theme');
        themeToggleBtn.textContent = '🌞';

        localStorage.setItem('theme', 'light');

    } else {

        bodyElement.setAttribute('data-theme', 'dark');
        themeToggleBtn.textContent = '🌙';

        localStorage.setItem('theme', 'dark');

    }
});

loadMembers();