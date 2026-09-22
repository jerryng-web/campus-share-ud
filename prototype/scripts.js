(function () {
  "use strict";

  var USER = { id: "me", name: "You" };
  var ITEMS_KEY = "campushare-ud-items";
  var REQUESTS_KEY = "campushare-ud-requests";

  var BUILDINGS = {
    "Laird Campus Suites": ["George Read", "Independence", "James Smith", "Thomas McKean"],
    "East Campus Traditional": [
      "Caesar Rodney",
      "Eliphalet Gilbert",
      "Harrington A–E",
      "Lane",
      "Louis L. Redding",
      "Russell A–D"
    ],
    "Central/South Campus": ["North Central", "South Central", "Smyth", "South Academy", "Ray Street A–B"],
    Apartments: ["University Courtyard", "Graduate Student Housing"]
  };

  var SEED_ITEMS = [
    {
      id: "item-vacuum",
      title: "Upright vacuum",
      description: "Works well on Harrington-style carpet. Empty the cup before you return it.",
      pickup: "George Read lobby after 5pm",
      category: "Appliances",
      complex: "Laird Campus Suites",
      building: "George Read",
      ownerId: "sam",
      ownerName: "Sam",
      status: "available"
    },
    {
      id: "item-steamer",
      title: "Garment steamer",
      description: "Ready for Friday presentations. Distilled water only.",
      pickup: "Caesar Rodney front desk — text when you are downstairs",
      category: "Appliances",
      complex: "East Campus Traditional",
      building: "Caesar Rodney",
      ownerId: "sam",
      ownerName: "Sam",
      status: "available"
    },
    {
      id: "item-iron",
      title: "Clothing iron",
      description: "Small board included. Use on a desk, not the carpet.",
      pickup: "Harrington courtyard",
      category: "Appliances",
      complex: "East Campus Traditional",
      building: "Harrington A–E",
      ownerId: "jordan",
      ownerName: "Jordan",
      status: "available"
    },
    {
      id: "item-drill",
      title: "Cordless drill",
      description: "Two batteries. Please return both charged.",
      pickup: "Ray Street A bike rack",
      category: "Tools",
      complex: "Central/South Campus",
      building: "Ray Street A–B",
      ownerId: "priya",
      ownerName: "Priya",
      status: "available"
    },
    {
      id: "item-grill",
      title: "George Foreman grill",
      description: "Wipe the plates. No lingering fish smells, please.",
      pickup: "Independence 3rd floor kitchen",
      category: "Kitchen",
      complex: "Laird Campus Suites",
      building: "Independence",
      ownerId: "chris",
      ownerName: "Chris",
      status: "available"
    },
    {
      id: "item-mattress",
      title: "Air mattress",
      description: "Queen size with pump. Overnight guests only, not for storage.",
      pickup: "University Courtyard mailroom",
      category: "Other",
      complex: "Apartments",
      building: "University Courtyard",
      ownerId: "maya",
      ownerName: "Maya",
      status: "available"
    },
    {
      id: "item-speaker",
      title: "Bluetooth speaker",
      description: "Keep it under quiet hours. Full charge lasts a study session.",
      pickup: "South Academy lounge",
      category: "Electronics",
      complex: "Central/South Campus",
      building: "South Academy",
      ownerId: "devon",
      ownerName: "Devon",
      status: "available"
    }
  ];

  var items = [];
  var requests = [];

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function loadState() {
    try {
      var storedItems = JSON.parse(localStorage.getItem(ITEMS_KEY) || "null");
      var storedRequests = JSON.parse(localStorage.getItem(REQUESTS_KEY) || "null");
      items = Array.isArray(storedItems) && storedItems.length ? storedItems : SEED_ITEMS.slice();
      requests = Array.isArray(storedRequests) ? storedRequests : [];
    } catch (err) {
      items = SEED_ITEMS.slice();
      requests = [];
    }
    saveState();
  }

  function saveState() {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  }

  function showToast(message) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.hidden = false;
    window.setTimeout(function () {
      toast.hidden = true;
    }, 2400);
  }

  function statusLabel(status) {
    if (status === "on_loan") return "On Loan";
    if (status === "requested") return "Requested";
    return "Available";
  }

  function findItem(id) {
    return items.find(function (item) {
      return item.id === id;
    });
  }

  function switchView(view) {
    document.querySelectorAll(".view").forEach(function (section) {
      section.classList.toggle("is-active", section.id === "view-" + view);
    });
    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("data-view") === view);
    });
    var nav = document.getElementById("site-nav");
    var toggle = document.getElementById("nav-toggle");
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
    if (view === "locker") renderLocker();
    if (view === "browse") renderBrowse();
  }

  function applyFilters() {
    var category = document.getElementById("filter-category").value;
    var location = document.getElementById("filter-location").value;
    return items.filter(function (item) {
      var categoryOk = category === "all" || item.category === category;
      var locationOk = location === "all" || item.complex === location;
      return categoryOk && locationOk;
    });
  }

  function renderBrowse() {
    var grid = document.getElementById("item-grid");
    var visible = applyFilters();
    document.getElementById("result-count").textContent =
      visible.length + (visible.length === 1 ? " item" : " items");

    if (!visible.length) {
      grid.innerHTML = '<p class="empty">Nothing matches those filters. Try another complex or category.</p>';
      return;
    }

    grid.innerHTML = visible
      .map(function (item) {
        var isMine = item.ownerId === USER.id;
        var canRequest = item.status === "available" && !isMine;
        var action = canRequest
          ? '<button class="btn btn-navy" type="button" data-request="' +
            item.id +
            '">Request to Borrow</button>'
          : isMine
            ? '<p class="owner-note">This is your listing. Manage it in My Locker.</p>'
            : '<p class="owner-note">Currently ' + statusLabel(item.status).toLowerCase() + ".</p>";

        return (
          '<article class="item-card">' +
          '<div class="badge-row">' +
          '<span class="badge">' +
          item.category +
          "</span>" +
          '<span class="badge status-' +
          item.status +
          '">' +
          statusLabel(item.status) +
          "</span>" +
          "</div>" +
          "<h3>" +
          escapeHtml(item.title) +
          "</h3>" +
          '<p class="meta">' +
          escapeHtml(item.complex) +
          " — " +
          escapeHtml(item.building) +
          "<br>Listed by " +
          escapeHtml(item.ownerName) +
          "</p>" +
          '<p class="meta">' +
          escapeHtml(item.description) +
          "</p>" +
          action +
          "</article>"
        );
      })
      .join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function activeRequestsForItem(itemId) {
    return requests.filter(function (req) {
      return req.itemId === itemId && (req.status === "pending" || req.status === "approved");
    });
  }

  function renderLocker() {
    var borrowing = requests.filter(function (req) {
      return req.borrowerId === USER.id && (req.status === "pending" || req.status === "approved");
    });
    var lendingItems = items.filter(function (item) {
      return item.ownerId === USER.id;
    });

    var borrowEl = document.getElementById("locker-borrowing");
    var lendEl = document.getElementById("locker-lending");

    borrowEl.innerHTML = borrowing.length
      ? borrowing
          .map(function (req) {
            var item = findItem(req.itemId);
            if (!item) return "";
            return (
              '<div class="locker-item">' +
              "<strong>" +
              escapeHtml(item.title) +
              "</strong>" +
              '<p class="meta">' +
              escapeHtml(item.complex) +
              " — " +
              escapeHtml(item.building) +
              "<br>" +
              req.startDate +
              " to " +
              req.endDate +
              " · " +
              statusLabel(item.status) +
              "</p>" +
              '<div class="locker-actions">' +
              '<button class="btn btn-navy" type="button" data-return="' +
              req.id +
              '">Mark as Returned</button>' +
              "</div></div>"
            );
          })
          .join("")
      : '<p class="meta">You are not borrowing anything yet. Request an item from Browse.</p>';

    lendEl.innerHTML = lendingItems.length
      ? lendingItems
          .map(function (item) {
            var pending = activeRequestsForItem(item.id);
            var requestBlock = pending
              .map(function (req) {
                var buttons =
                  req.status === "pending"
                    ? '<button class="btn btn-gold" type="button" data-approve="' +
                      req.id +
                      '">Approve</button>' +
                      '<button class="btn btn-ghost" type="button" data-deny="' +
                      req.id +
                      '">Deny</button>'
                    : '<span class="meta">Approved for ' +
                      escapeHtml(req.borrowerName) +
                      ". Waiting for return.</span>";
                return (
                  '<p class="meta">Request from ' +
                  escapeHtml(req.borrowerName) +
                  " · " +
                  req.startDate +
                  " to " +
                  req.endDate +
                  "</p>" +
                  '<div class="locker-actions">' +
                  buttons +
                  "</div>"
                );
              })
              .join("");

            return (
              '<div class="locker-item">' +
              "<strong>" +
              escapeHtml(item.title) +
              "</strong>" +
              '<p class="meta">' +
              escapeHtml(item.complex) +
              " — " +
              escapeHtml(item.building) +
              " · " +
              statusLabel(item.status) +
              "</p>" +
              (requestBlock || '<p class="meta">No active requests.</p>') +
              "</div>"
            );
          })
          .join("")
      : '<p class="meta">You have not listed anything yet. Add gear under List Your Stuff.</p>';
  }

  function populateBuildings(complex, selected) {
    var select = document.getElementById("item-building");
    var options = BUILDINGS[complex] || [];
    select.innerHTML =
      '<option value="">Select a building</option>' +
      options
        .map(function (name) {
          var isSelected = name === selected ? " selected" : "";
          return '<option value="' + name + '"' + isSelected + ">" + name + "</option>";
        })
        .join("");
  }

  function openRequestModal(itemId) {
    var item = findItem(itemId);
    if (!item) return;
    document.getElementById("request-item-id").value = item.id;
    document.getElementById("request-item-label").textContent =
      item.title + " · " + item.complex + " — " + item.building;
    var today = new Date().toISOString().slice(0, 10);
    document.getElementById("request-start").value = today;
    document.getElementById("request-end").value = today;
    document.getElementById("request-modal").showModal();
  }

  function handleRequestSubmit(event) {
    event.preventDefault();
    var itemId = document.getElementById("request-item-id").value;
    var startDate = document.getElementById("request-start").value;
    var endDate = document.getElementById("request-end").value;
    var item = findItem(itemId);
    if (!item || item.status !== "available" || item.ownerId === USER.id) return;
    if (endDate < startDate) {
      showToast("End date must be on or after the start date.");
      return;
    }

    item.status = "requested";
    requests.push({
      id: uid("req"),
      itemId: item.id,
      borrowerId: USER.id,
      borrowerName: USER.name,
      startDate: startDate,
      endDate: endDate,
      status: "pending"
    });
    saveState();
    document.getElementById("request-modal").close();
    renderBrowse();
    showToast("Request sent. It is in My Locker as Requested.");
  }

  function handleReturn(requestId) {
    var req = requests.find(function (row) {
      return row.id === requestId;
    });
    if (!req) return;
    var item = findItem(req.itemId);
    req.status = "returned";
    if (item) item.status = "available";
    saveState();
    renderLocker();
    renderBrowse();
    showToast("Marked as returned. The item is Available again.");
  }

  function handleApprove(requestId) {
    var req = requests.find(function (row) {
      return row.id === requestId;
    });
    if (!req) return;
    var item = findItem(req.itemId);
    if (!item || item.ownerId !== USER.id) return;
    req.status = "approved";
    item.status = "on_loan";
    saveState();
    renderLocker();
    renderBrowse();
    showToast("Request approved. Status is On Loan.");
  }

  function handleDeny(requestId) {
    var req = requests.find(function (row) {
      return row.id === requestId;
    });
    if (!req) return;
    var item = findItem(req.itemId);
    if (!item || item.ownerId !== USER.id) return;
    req.status = "denied";
    item.status = "available";
    saveState();
    renderLocker();
    renderBrowse();
    showToast("Request denied. The item is Available again.");
  }

  function handleListSubmit(event) {
    event.preventDefault();
    var title = document.getElementById("item-name").value.trim();
    var category = document.getElementById("item-category").value;
    var complex = document.getElementById("item-complex").value;
    var building = document.getElementById("item-building").value;
    var description = document.getElementById("item-description").value.trim();
    var pickup = document.getElementById("item-pickup").value.trim();

    if (!title || !category || !complex || !building || !description) {
      showToast("Please complete the required fields.");
      return;
    }

    items.unshift({
      id: uid("item"),
      title: title,
      description: description,
      pickup: pickup || "Message to coordinate pick-up.",
      category: category,
      complex: complex,
      building: building,
      ownerId: USER.id,
      ownerName: USER.name,
      status: "available"
    });
    saveState();
    event.target.reset();
    populateBuildings("");
    document.getElementById("filter-category").value = "all";
    document.getElementById("filter-location").value = "all";
    switchView("browse");
    renderBrowse();
    showToast(title + " is now on CampusShare.");
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach(function (el) {
      el.addEventListener("click", function (event) {
        event.preventDefault();
        switchView(el.getAttribute("data-view"));
      });
    });

    document.getElementById("nav-toggle").addEventListener("click", function () {
      var nav = document.getElementById("site-nav");
      var open = nav.classList.toggle("open");
      this.setAttribute("aria-expanded", open ? "true" : "false");
      this.textContent = open ? "Close" : "Menu";
    });

    document.getElementById("filter-category").addEventListener("change", renderBrowse);
    document.getElementById("filter-location").addEventListener("change", renderBrowse);

    document.getElementById("item-complex").addEventListener("change", function () {
      populateBuildings(this.value);
    });

    document.getElementById("list-form").addEventListener("submit", handleListSubmit);

    document.getElementById("item-grid").addEventListener("click", function (event) {
      var button = event.target.closest("[data-request]");
      if (button) openRequestModal(button.getAttribute("data-request"));
    });

    document.getElementById("request-form").addEventListener("submit", handleRequestSubmit);
    document.getElementById("request-cancel").addEventListener("click", function () {
      document.getElementById("request-modal").close();
    });

    document.getElementById("locker-borrowing").addEventListener("click", function (event) {
      var button = event.target.closest("[data-return]");
      if (button) handleReturn(button.getAttribute("data-return"));
    });

    document.getElementById("locker-lending").addEventListener("click", function (event) {
      var approve = event.target.closest("[data-approve]");
      var deny = event.target.closest("[data-deny]");
      if (approve) handleApprove(approve.getAttribute("data-approve"));
      if (deny) handleDeny(deny.getAttribute("data-deny"));
    });
  }

  loadState();
  bindEvents();
  renderBrowse();
})();
