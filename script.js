const membersGrid = document.getElementById('membersGrid');
const searchInput = document.getElementById('searchInput');
const noResultMsg = document.getElementById('noResult');

// Các phần tử của MODAL
const modal = document.getElementById('memberModal');
const closeBtn = document.querySelector('.close-btn');
const modalAvatar = document.getElementById('modalAvatar');
const modalName = document.getElementById('modalName');
const modalRole = document.getElementById('modalRole');
const modalDob = document.getElementById('modalDob');
const modalHobbiesList = document.getElementById('modalHobbiesList');
const modalDescription = document.getElementById('modalDescription');
const modalContact = document.getElementById('modalContact');

// Biến toàn cục để lưu trữ dữ liệu thành viên sau khi tải
let loadedMembersData = [];

// 1. Hàm tải dữ liệu
async function loadMembers() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        loadedMembersData = data.members; // Lưu dữ liệu lại để dùng cho modal
        renderMembers(loadedMembersData);
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        membersGrid.innerHTML = '<p style="text-align:center; width:100%">Không tải được dữ liệu thành viên :(</p>';
    }
}

// 2. Hàm hiển thị danh sách thẻ (Giao diện rút gọn bên ngoài)
function renderMembers(members) {
    membersGrid.innerHTML = '';

    members.forEach((member, index) => {
        // 1. Xử lý Description (giữ nguyên code của bạn)
        let descriptionHtml = "Chưa có mô tả...";
        if (member['short-description'] && member['short-description'].length > 0) {
            descriptionHtml = member['short-description']
                .map(line => `<div>${line}</div>`)
                .join('');
        }

        // 2. --- XỬ LÝ AVATAR (MỚI) ---
        // Kiểm tra xem avatar có phải là đường dẫn ảnh không (có chứa dấu chấm . hoặc dấu gạch chéo /)
        const isImage = member.avatar.includes('.') || member.avatar.includes('/') || member.avatar.includes('http');

        let avatarContent = '';
        if (isImage) {
            // Nếu là ảnh -> Dùng thẻ img
            avatarContent = `<img src="${member.avatar}" alt="${member.name}">`;
        } else {
            // Nếu là emoji -> Dùng text bình thường
            avatarContent = member.avatar;
        }
        // -----------------------------

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


// 3. Hàm gắn sự kiện click cho các thẻ card
function attachClickEventToCards() {
    const cards = document.querySelectorAll('.member-card');
    cards.forEach(card => {
        card.addEventListener('click', function () {
            const index = this.getAttribute('data-index'); // Lấy số thứ tự thành viên
            openModal(index); // Mở modal với data tương ứng
        });
    });
}

// 4. Hàm MỞ Modal và điền dữ liệu
function openModal(index) {
    const member = loadedMembersData[index]; // Lấy data thành viên từ mảng

    // Điền dữ liệu vào các vị trí trong Modal
    const isImage = member.avatar.includes('.') || member.avatar.includes('/') || member.avatar.includes('http');

    if (isImage) {
        // Nếu là ảnh, xóa text cũ và chèn thẻ img
        modalAvatar.textContent = '';
        modalAvatar.innerHTML = `<img src="${member.avatar}" style="width:100%; height:100%; object-fit:cover;">`;
    } else {
        // Nếu là emoji
        modalAvatar.innerHTML = ''; // Xóa thẻ img cũ nếu có
        modalAvatar.textContent = member.avatar;
    }
    modalName.textContent = member.name;
    modalRole.textContent = member.role;
    modalDob.textContent = member.dateofbirth;

    // Tạo danh sách sở thích cho modal
    modalHobbiesList.innerHTML = member.hobbies.map(hobby => `<li>${hobby}</li>`).join('');

    // Tạo các dòng mô tả cho modal
    modalDescription.innerHTML = member['short-description'].map(desc => `<p>${desc}</p>`).join('');

    // --- PHẦN XỬ LÝ LIÊN HỆ (ĐÃ CẬP NHẬT) ---
    let contactHtml = '';

    if (member.contact.instagram) {
        contactHtml = `<div><a href="https://instagram.com/${member.contact.instagram}" target="_blank">📸 IG: ${member.contact.instagram}</a></div>`;
    } else if (member.contact.facebook) {
        // Mặc định hiển thị là "Facebook" nếu không cắt được
        let fbDisplayName = "Facebook";

        try {
            const url = member.contact.facebook;
            // Regex: Tìm phần nằm sau "facebook.com/" nhưng dừng lại trước dấu "/" hoặc "?"
            const match = url.match(/facebook\.com\/([^\/\?]+)/);

            // Nếu tìm thấy khớp (ví dụ: anh.hong.955297)
            if (match && match[1]) {
                fbDisplayName = match[1];
            }
        } catch (e) {
            console.error("Lỗi xử lý link Facebook", e);
        }

        // Hiển thị tên đã cắt được vào thẻ <a>
        contactHtml = `<div><a href="${member.contact.facebook}" target="_blank">📘 FB: ${fbDisplayName}</a></div>`;
    }

    modalContact.innerHTML = contactHtml;

    // Hiện Modal lên
    modal.style.display = 'flex';
}


// 5. Các cách để ĐÓNG Modal
// Cách 1: Click nút X
closeBtn.addEventListener('click', closeModal);
// Cách 2: Click ra vùng nền tối bên ngoài
modal.addEventListener('click', function (e) {
    if (e.target === modal) { // Chỉ đóng nếu click trúng lớp nền mờ (overlay)
        closeModal();
    }
});

function closeModal() {
    modal.style.display = 'none';
}


// 6. Logic tìm kiếm (Vẫn giữ nguyên từ bài trước)
searchInput.addEventListener('keyup', function (e) {
    const keyword = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.member-card');
    let hasResult = false;

    cards.forEach((card, index) => {
        // Lấy data gốc từ mảng dựa trên index để tìm kiếm chính xác hơn
        const memberData = loadedMembersData[index];

        const name = memberData.name.toLowerCase();
        // Tìm trong mảng hobbies và short-description
        const hobbies = memberData.hobbies.join(' ').toLowerCase();
        const description = memberData['short-description'].join(' ').toLowerCase();

        // Xử lý tìm kiếm liên hệ
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

// =========================================
// LOGIC CHUYỂN ĐỔI SÁNG / TỐI (THEME)
// =========================================
const themeToggleBtn = document.getElementById('themeToggle');
const bodyElement = document.body;

// 1. Kiểm tra xem người dùng đã lưu chế độ nào trước đó chưa
const savedTheme = localStorage.getItem('theme');

// Nếu đã lưu 'dark', thì bật chế độ tối ngay khi vào web
if (savedTheme === 'dark') {
    bodyElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '🌙'; // Đổi icon thành mặt trăng
}

// 2. Sự kiện click vào nút
themeToggleBtn.addEventListener('click', function () {
    // Kiểm tra xem đang ở chế độ nào
    const currentTheme = bodyElement.getAttribute('data-theme');

    if (currentTheme === 'dark') {
        // Nếu đang tối -> chuyển sang sáng
        bodyElement.removeAttribute('data-theme');
        themeToggleBtn.textContent = '🌞'; // Icon mặt trời
        localStorage.setItem('theme', 'light'); // Lưu lại
    } else {
        // Nếu đang sáng -> chuyển sang tối
        bodyElement.setAttribute('data-theme', 'dark');
        themeToggleBtn.textContent = '🌙'; // Icon mặt trăng
        localStorage.setItem('theme', 'dark'); // Lưu lại
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const memoryGrid = document.getElementById('memory-grid');
    const overlay = document.getElementById('overlay');
    const jsonUrl = './memories.json';

    let activeClone = null;
    let activeOriginal = null;
    let savedRotation = '';

    // 1. Render dữ liệu (Giữ nguyên)
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

    // 2. Xử lý Click để Zoom
    memoryGrid.addEventListener('click', (e) => {
        const item = e.target.closest('.polaroid-item');
        if (!item || activeClone) return;

        activeOriginal = item;
        savedRotation = item.style.transform;
        const rect = item.getBoundingClientRect();

        activeClone = item.cloneNode(true);
        activeClone.classList.add('polaroid-clone');

        // Bỏ hết margin của clone để tránh lệch do CSS bên ngoài tác động
        activeClone.style.margin = '0';

        // Giai đoạn 1: Khởi tạo
        activeClone.style.top = `${rect.top}px`;
        activeClone.style.left = `${rect.left}px`;
        activeClone.style.width = `${rect.width}px`;
        activeClone.style.height = `${rect.height}px`;
        activeClone.style.transform = `${savedRotation} scale(1)`;

        document.body.appendChild(activeClone);

        // Giai đoạn 2: Zoom ra giữa
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        // Tính toán tâm màn hình dựa trên kích thước hiện tại của clone
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

    // 3. Hàm đóng (SỬA LỖI LỆCH TẠI ĐÂY)
    function closeZoom() {
        if (!activeClone || !activeOriginal) return;

        activeClone.classList.remove('zoomed');
        overlay.classList.remove('active');

        // B1: Lấy lại vị trí & KÍCH THƯỚC chuẩn của ảnh gốc (lúc không hover)
        const rect = activeOriginal.getBoundingClientRect();

        // B2: Cập nhật lại vị trí cho Clone bay về
        activeClone.style.top = `${rect.top}px`;
        activeClone.style.left = `${rect.left}px`;

        // --- QUAN TRỌNG: CẬP NHẬT CẢ WIDTH/HEIGHT ---
        // Vì lúc đầu click vào (đang hover) nên width/height có thể to hơn bình thường.
        // Giờ bay về trạng thái tĩnh thì phải ép width/height về đúng size gốc.
        activeClone.style.width = `${rect.width}px`;
        activeClone.style.height = `${rect.height}px`;

        // B3: Trả về scale(1) chuẩn, đừng dùng 0.88
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

// Chạy khi tải trang
loadMembers();