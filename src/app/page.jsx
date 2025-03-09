"use client";
import React from "react";

function MainComponent() {
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedConnectionTypes, setSelectedConnectionTypes] = React.useState(
    []
  );
  const [selectedHousingType, setSelectedHousingType] =
    React.useState("mansion");
  const [plans, setPlans] = React.useState(null);
  const [monthlyFee, setMonthlyFee] = React.useState(5000);
  const [selectedPrefecture, setSelectedPrefecture] = React.useState("");
  const [selectedCity, setSelectedCity] = React.useState("");
  const [cities, setCities] = React.useState([]);
  const [sortOption, setSortOption] = React.useState("price-asc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedPlans, setSelectedPlans] = React.useState([]);
  const [filteredPlans, setFilteredPlans] = React.useState(null);
  const ITEMS_PER_PAGE = 10;
  const prefectures = [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ];
  const connectionTypes = [
    { id: "optical", label: "光回線" },
    { id: "home-router", label: "ホームルーター" },
    { id: "mobile-router", label: "モバイルルーター" },
  ];
  const housingTypes = [
    { id: "mansion", label: "マンション" },
    { id: "house", label: "一戸建て" },
  ];
  const getPrefectureCode = (prefName) => {
    const index = prefectures.indexOf(prefName);
    return (index + 1).toString().padStart(2, "0");
  };
  const handlePrefectureChange = async (prefecture) => {
    setSelectedPrefecture(prefecture);
    setSelectedCity("");
    if (prefecture) {
      try {
        const prefCode = getPrefectureCode(prefecture);
        const response = await fetch("/api/fetch-city-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prefCode: prefCode }),
        });
        if (!response.ok) throw new Error("市区町村の取得に失敗しました");
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setCities(data.response || []);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setError(error.message);
        setCities([]);
      }
    } else {
      setCities([]);
    }
  };
  const handleConnectionTypeChange = (type) => {
    setSelectedConnectionTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };
  const handlePlanSelection = (planId) => {
    setSelectedPlans((prev) => {
      if (prev.includes(planId)) {
        return prev.filter((id) => id !== planId);
      } else {
        return [...prev, planId];
      }
    });
  };
  const handleFilter = () => {
    if (selectedPlans.length === 0) {
      setFilteredPlans(null);
    } else {
      const filtered = plans.filter((plan) => selectedPlans.includes(plan.id));
      setFilteredPlans(filtered);
    }
    setCurrentPage(1);
  };
  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSelectedPlans([]);
    setFilteredPlans(null);
    console.log("検索開始:", {
      connectionTypes: selectedConnectionTypes,
      housingType: selectedHousingType,
      monthlyFee: monthlyFee,
      prefecture: selectedPrefecture,
      city: selectedCity,
    });

    setLoading(true);
    setError(null);

    try {
      console.log("APIリクエスト開始");
      const response = await fetch("/api/fetch-internet-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedConnectionTypes,
          housingType: selectedHousingType,
          monthlyFee: parseInt(monthlyFee),
          prefecture: selectedPrefecture,
          city: selectedCity,
        }),
      });

      if (!response.ok) {
        throw new Error("プランの検索に失敗しました");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPlans(data.response || []);
    } catch (err) {
      console.error("検索エラー:", err);
      setError(err.message);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };
  const sortedPlans =
    filteredPlans || plans
      ? [...(filteredPlans || plans)].sort((a, b) => {
          switch (sortOption) {
            case "price-desc":
              return b.price - a.price;
            case "effective-price-asc":
              return a.effective_monthly_amount - b.effective_monthly_amount;
            case "effective-price-desc":
              return b.effective_monthly_amount - a.effective_monthly_amount;
            case "speed-desc":
              return parseInt(b.effective_speed) - parseInt(a.effective_speed);
            case "speed-asc":
              return parseInt(a.effective_speed) - parseInt(b.effective_speed);
            default: // price-asc
              return a.price - b.price;
          }
        })
      : null;
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentPlans = sortedPlans?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = sortedPlans
    ? Math.ceil(sortedPlans.length / ITEMS_PER_PAGE)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        インターネット回線を探す
      </h1>
      <form onSubmit={handleSearch} className="mb-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">都道府県</label>
            <select
              value={selectedPrefecture}
              onChange={(e) => handlePrefectureChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">選択してください</option>
              {prefectures.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
          </div>

          {selectedPrefecture && (
            <div>
              <label className="block text-sm mb-2">市区町村</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">選択してください</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">
              回線タイプ（複数選択可）
            </label>
            <div className="flex flex-wrap gap-4">
              {connectionTypes.map((type) => (
                <label key={type.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedConnectionTypes.includes(type.id)}
                    onChange={() => handleConnectionTypeChange(type.id)}
                    className="form-checkbox"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">住宅タイプ</label>
            <div className="flex gap-4">
              {housingTypes.map((type) => (
                <label key={type.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="housingType"
                    value={type.id}
                    checked={selectedHousingType === type.id}
                    onChange={(e) => setSelectedHousingType(e.target.value)}
                    className="form-radio"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm">
            月額料金の上限: {monthlyFee.toLocaleString()}円
          </label>
          <input
            type="range"
            min="2000"
            max="10000"
            step="500"
            value={monthlyFee}
            onChange={(e) => setMonthlyFee(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-[#4F67FF] text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            プランを検索
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center">検索中...</div>
      ) : error ? (
        <div className="text-red-600 mb-4 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      ) : plans === null ? null : plans.length > 0 ? (
        <>
          <div className="mb-4 flex justify-between items-center">
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-auto p-2 border rounded"
            >
              <option value="price-asc">月額料金の安い順</option>
              <option value="price-desc">月額料金の高い順</option>
              <option value="effective-price-asc">実質月額の安い順</option>
              <option value="effective-price-desc">実質月額の高い順</option>
              <option value="speed-desc">実効速度の速い順</option>
              <option value="speed-asc">実効速度の遅い順</option>
            </select>
            <button
              onClick={handleFilter}
              disabled={selectedPlans.length === 0}
              className={`ml-4 px-4 py-2 rounded ${
                selectedPlans.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#4F67FF] text-white hover:bg-blue-600"
              } transition-colors`}
            >
              {selectedPlans.length === 0
                ? "プランを選択して絞り込む"
                : `選択したサービスに絞り込む (${selectedPlans.length}件)`}
            </button>
          </div>
          <div className="space-y-4">
            {currentPlans.map((plan) => (
              <div key={plan.id} className="border rounded p-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedPlans.includes(plan.id)}
                    onChange={() => handlePlanSelection(plan.id)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p>回線タイプ: {plan.type}</p>
                      <p>住居タイプ: {plan.housing}</p>
                      <p>月額料金: {plan.price.toLocaleString()}円</p>
                      <p>
                        実質月額:{" "}
                        {plan.effective_monthly_amount.toLocaleString()}円
                      </p>
                      <p>
                        {plan.type === "ホームルーター" ||
                        plan.type === "モバイルルーター"
                          ? `機器代金: ${
                              isNaN(Number(plan.construction_cost))
                                ? plan.construction_cost
                                : `${Number(
                                    plan.construction_cost
                                  ).toLocaleString()}円`
                            }`
                          : `工事費: ${
                              isNaN(Number(plan.construction_cost))
                                ? plan.construction_cost
                                : `${Number(
                                    plan.construction_cost
                                  ).toLocaleString()}円`
                            }`}
                      </p>
                      <p>
                        実効速度:{" "}
                        {parseInt(plan.effective_speed).toLocaleString()}
                        Mbps
                      </p>
                      {plan.special && <p>特典: {plan.special}</p>}
                      <a
                        href={plan.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        詳細を見る
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleFilter}
              disabled={selectedPlans.length === 0}
              className={`px-4 py-2 rounded ${
                selectedPlans.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#4F67FF] text-white hover:bg-blue-600"
              } transition-colors`}
            >
              {selectedPlans.length === 0
                ? "サービスを選択して絞り込む"
                : `選択したサービスに絞り込む (${selectedPlans.length}件)`}
            </button>
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500"
                    : "bg-[#4F67FF] text-white hover:bg-blue-600"
                }`}
              >
                前へ
              </button>
              <span className="text-sm">
                {currentPage} / {totalPages} ページ
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500"
                    : "bg-[#4F67FF] text-white hover:bg-blue-600"
                }`}
              >
                次へ
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center">プランが見つかりませんでした</div>
      )}
    </div>
  );
}

export default MainComponent;