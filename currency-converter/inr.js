const currencyToCountry = {
  USD: "US", EUR: "EU", GBP: "GB", AUD: "AU", CHF: "CH", CAD: "CA", JPY: "JP", EGP: "EG", KRW: "KR", DZD: "DZ",
  BHD: "BH", MAD: "MA", ZAR: "ZA", IQD: "IQ", BOB: "BO", HKD: "HK", THB: "TH", TWD: "TW", UZS: "UZ", KWD: "KW",
  ILS: "IL", PEN: "PE", TJS: "TJ", OMR: "OM", HUF: "HU", UAH: "UA", CLP: "CL", SEK: "SE", SGD: "SG", CNY: "CN",
  ISK: "IS", AZN: "AZ", LBP: "LB", MYR: "MY", IRR: "IR", UYU: "UY", PHP: "PH", LYD: "LY", JOD: "JO", TRY: "TR",
  NGN: "NG", RSD: "RS", NZD: "NZ", CZK: "CZ", BYN: "BY", ARS: "AR", NOK: "NO", QAR: "QA", BDT: "BD", RON: "RO",
  MDL: "MD", CRC: "CR", VES: "VE", IDR: "ID", MXN: "MX", AMD: "AM", PYG: "PY", AED: "AE", NPR: "NP", KGS: "KG",
  BRL: "BR", INR: "IN", TND: "TN", VND: "VN", TMT: "TM", DKK: "DK", LKR: "LK", BGN: "BG", RUB: "RU", GEL: "GE",
  PKR: "PK", PLN: "PL", KZT: "KZ", COP: "CO", SAR: "SA"
};

const exchangeRates = { usd: 1 };
const inputAmount = document.querySelector(".input-amount");
const result = document.querySelector(".result");
const swapBtn = document.querySelector(".swap-btn");

const currentValues = {
  fromCurrency: "USD - U.S. Dollar",
  fromFlag: "https://www.countryflagicons.com/FLAT/64/US.png",
  fromCode: "USD",
  toCurrency: "EUR - Euro",
  toFlag: "https://www.countryflagicons.com/FLAT/64/EU.png",
  toCode: "EUR"
};

const convert = () => {
  const inputValue = parseFloat(inputAmount.value);
  const fromCode = document.querySelector("#from .currency-input").dataset.selectedCurrencyCode?.toLowerCase();
  const toCode = document.querySelector("#to .currency-input").dataset.selectedCurrencyCode?.toLowerCase();
  if (!fromCode || !toCode || isNaN(inputValue)) {
    result.textContent = "Invalid Input";
    return;
  }
  const converted = (inputValue * exchangeRates[toCode]) / exchangeRates[fromCode];
  result.innerHTML = `<span class="result-currency">${toCode.toUpperCase()}</span> ${converted.toFixed(2)}`;
};

const setInputValues = (currency, flag, code, id) => {
  const dropdown = document.getElementById(id);
  const input = dropdown.querySelector(".currency-input");
  const flagImg = dropdown.querySelector(".input-flag");
  input.value = currency;
  flagImg.src = flag;
  input.dataset.selectedCurrencyCode = code;
};

const createOption = (code, name, id) => {
  const dropdown = document.getElementById(id);
  const options = dropdown.querySelector(".options");
  const option = document.createElement("div");
  option.className = "option";

  const flag = document.createElement("div");
  flag.className = "flag";
  const flagImg = document.createElement("img");

  const countryCode = currencyToCountry[code];
  if (countryCode) {
    flagImg.src = `https://www.countryflagicons.com/FLAT/64/${countryCode}.png`;
  } else {
    console.warn(`Missing country mapping for currency code: ${code}`);
    flagImg.src = "https://upload.wikimedia.org/wikipedia/commons/e/e3/Unofficial_flag_placeholder.png";
  }

  flag.appendChild(flagImg);

  const text = document.createElement("div");
  text.textContent = `${code} - ${name}`;
  option.append(flag, text);

  option.addEventListener("click", () => {
    options.classList.remove("active");
    setInputValues(`${code} - ${name}`, flagImg.src, code, id);
    if (id === "from") {
      Object.assign(currentValues, { fromCurrency: text.textContent, fromFlag: flagImg.src, fromCode: code });
    } else {
      Object.assign(currentValues, { toCurrency: text.textContent, toFlag: flagImg.src, toCode: code });
    }
    convert();
  });

  options.appendChild(option);
};

const filterOptions = (id) => {
  const input = document.querySelector(`#${id} .currency-input`);
  const term = input.value.toLowerCase();
  document.querySelectorAll(`#${id} .option`).forEach(option => {
    option.style.display = option.textContent.toLowerCase().includes(term) ? "flex" : "none";
  });
};

const addEventListeners = (id) => {
  const dropdown = document.getElementById(id);
  const input = dropdown.querySelector(".currency-input");
  const options = dropdown.querySelector(".options");

  input.addEventListener("input", () => filterOptions(id));
  input.addEventListener("click", () => {
    document.querySelectorAll(".options").forEach(opt => opt.classList.remove("active"));
    options.classList.add("active");
    input.value = "";
  });
};

document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown-container")) {
    document.querySelectorAll(".options").forEach(opt => opt.classList.remove("active"));
    updateValues();
  }
});

const updateValues = () => {
  setInputValues(currentValues.fromCurrency, currentValues.fromFlag, currentValues.fromCode, "from");
  setInputValues(currentValues.toCurrency, currentValues.toFlag, currentValues.toCode, "to");
};

swapBtn.addEventListener("click", () => {
  [currentValues.fromCurrency, currentValues.toCurrency] = [currentValues.toCurrency, currentValues.fromCurrency];
  [currentValues.fromFlag, currentValues.toFlag] = [currentValues.toFlag, currentValues.fromFlag];
  [currentValues.fromCode, currentValues.toCode] = [currentValues.toCode, currentValues.fromCode];
  updateValues();
  convert();
});

inputAmount.addEventListener("input", convert);

const init = async () => {
  const res = await fetch("https://www.floatrates.com/daily/usd.json");
  const data = await res.json();

  // Add USD manually
  createOption("USD", "U.S. Dollar", "from");
  createOption("USD", "U.S. Dollar", "to");

  for (const key in data) {
    const { code, name, rate } = data[key];
    exchangeRates[code.toLowerCase()] = rate;
    createOption(code, name, "from");
    createOption(code, name, "to");
  }

  updateValues();
  addEventListeners("from");
  addEventListeners("to");
  convert();
};

init();
