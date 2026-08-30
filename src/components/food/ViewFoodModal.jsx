import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import {
  X,
  Utensils,
  Tag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Pencil,
  Percent,
  CalendarDays,
} from "lucide-react";
import ImageCarousel from "../global/ImageCarousel";

const InfoField = ({ icon: Icon, label, value }) => {
  const hasValue =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    value !== "—";

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        {Icon && <Icon size={12} className="text-[#532C89]" />}

        <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em]">
          {label}
        </span>
      </div>

      <p className="text-sm font-semibold text-gray-800 leading-snug break-words">
        {hasValue ? value : "N/A"}
      </p>
    </div>
  );
};

const StatusBadge = ({ available }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${
      available
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-red-50 text-red-600 border-red-200"
    }`}
  >
    {available ? (
      <CheckCircle2 size={11} />
    ) : (
      <XCircle size={11} />
    )}

    {available ? "Available" : "Unavailable"}
  </span>
);

const ViewFoodModal = ({ food, onClose, onEdit }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!food) return null;

  const images = Array.isArray(food.images) ? food.images : [];

  const isAvailable =
    !food.isDelete && food.status !== "UNAVAILABLE";

  const categoryName =
    typeof food.category === "object"
      ? food.category?.name
      : food.category;

  // The backend uses different spellings for discount fields.
  const discountVal =
    food.disCountParcentage ??
    food.discountParcentage ??
    food.discountPercentage ??
    food.discountParcenTage ??
    0;

  const showDiscount =
    (food.isDisCount ?? food.isDiscount) &&
    Number(discountVal) > 0;

  const deliveryFee =
    food.delivery_fee ?? food.deliveryFee;

  const deliveryTime =
    food.delivery_time ?? food.deliveryTime;

  const getImageUrl = (image) => {
    if (typeof image === "object") {
      return image?.url;
    }

    return image;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/55 backdrop-blur-[3px] p-3 sm:p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          bg-white
          w-full
          max-w-2xl
          rounded-2xl
          shadow-[0_20px_60px_rgba(0,0,0,0.18)]
          overflow-hidden
          flex
          flex-col
        "
        style={{
          maxHeight: "calc(100vh - 32px)",
          animation: "modalIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="
            flex
            items-center
            justify-between
            px-5
            sm:px-7
            py-4
            border-b
            border-gray-100
            shrink-0
          "
        >
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Food Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              w-9
              h-9
              rounded-lg
              flex
              items-center
              justify-center
              text-gray-400
              hover:text-gray-700
              hover:bg-gray-100
              transition-all
              cursor-pointer
              shrink-0
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-7 py-5">
          <div className="space-y-7">

            {/* Food Overview */}
            <section>
              <div className="flex items-center gap-2.5 mb-4">
                <Utensils
                  size={16}
                  className="text-[#532C89]"
                />

                <h3 className="text-[13px] font-bold text-gray-700">
                  Food Overview
                </h3>

                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <div
                className="
                  border
                  border-gray-100
                  rounded-xl
                  overflow-hidden
                  bg-gray-50/40
                "
              >
                <div className="flex flex-col sm:flex-row gap-5 p-4 sm:p-5">

                  {/* Main Image Slider */}
                  <div
                    className="
                      w-full
                      sm:w-40
                      h-40
                      sm:h-32
                      shrink-0
                      rounded-xl
                      overflow-hidden
                      border
                      border-gray-200
                      bg-gray-100
                    "
                  >
                    <ImageCarousel
                      images={images}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Food Info */}
                  <div className="flex-1 min-w-0">

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight break-words">
                          {food.name || "N/A"}
                        </h3>

                        {categoryName && (
                          <div className="mt-2">
                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                px-2.5
                                py-1
                                rounded-full
                                bg-[#532C89]/5
                                text-[#532C89]
                                border
                                border-[#532C89]/10
                                text-[10px]
                                font-bold
                              "
                            >
                              <Tag size={10} />
                              {categoryName}
                            </span>
                          </div>
                        )}
                      </div>

                      <StatusBadge available={isAvailable} />
                    </div>

                    {food.short_description && (
                      <p
                        className="
                          text-sm
                          text-gray-500
                          leading-relaxed
                          mt-3
                          line-clamp-3
                        "
                      >
                        {food.short_description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section>
              <div className="flex items-center gap-2.5 mb-4">
                <Tag
                  size={16}
                  className="text-[#532C89]"
                />

                <h3 className="text-[13px] font-bold text-gray-700">
                  Pricing & Delivery
                </h3>

                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {/* Price */}
                <div
                  className="
                    rounded-xl
                    border
                    border-gray-100
                    bg-gray-50/60
                    p-4
                  "
                >
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-2">
                    Price
                  </span>

                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-gray-500">
                      ৳
                    </span>

                    <span className="text-xl font-bold text-gray-900">
                      {food.price ?? "N/A"}
                    </span>
                  </div>
                </div>

                {/* Delivery Fee */}
                <div
                  className="
                    rounded-xl
                    border
                    border-gray-100
                    bg-gray-50/60
                    p-4
                  "
                >
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-2">
                    Delivery Fee
                  </span>

                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-gray-500">
                      ৳
                    </span>

                    <span className="text-xl font-bold text-gray-900">
                      {deliveryFee ?? "N/A"}
                    </span>
                  </div>
                </div>

                {/* Delivery Time */}
                <div
                  className="
                    rounded-xl
                    border
                    border-gray-100
                    bg-gray-50/60
                    p-4
                  "
                >
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-2">
                    Delivery Time
                  </span>

                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">
                      {deliveryTime ?? "N/A"}
                    </span>

                    {deliveryTime && (
                      <span className="text-xs font-medium text-gray-400">
                        min
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Discount */}
            {showDiscount && (
              <section>
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-xl
                    border
                    border-amber-200
                    bg-amber-50/70
                    px-4
                    py-3.5
                  "
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="
                        w-9
                        h-9
                        rounded-lg
                        bg-amber-100
                        flex
                        items-center
                        justify-center
                        shrink-0
                      "
                    >
                      <Percent
                        size={16}
                        className="text-amber-600"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-700">
                        Active Discount
                      </p>

                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Special discount is currently applied to this food.
                      </p>
                    </div>
                  </div>

                  <span className="text-base sm:text-lg font-bold text-amber-600 shrink-0">
                    {discountVal}% OFF
                  </span>
                </div>
              </section>
            )}

            {/* Food Information */}
            <section>
              <div className="flex items-center gap-2.5 mb-4">
                <Utensils
                  size={16}
                  className="text-[#532C89]"
                />

                <h3 className="text-[13px] font-bold text-gray-700">
                  Food Information
                </h3>

                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <div
                className="
                  border
                  border-gray-100
                  rounded-xl
                  overflow-hidden
                "
              >
                <div className="grid grid-cols-1 sm:grid-cols-2">

                  <div className="p-4 sm:p-5">
                    <InfoField
                      icon={CheckCircle2}
                      label="Status"
                      value={food.status ?? "AVAILABLE"}
                    />
                  </div>

                  <div className="p-4 sm:p-5 sm:border-l border-gray-100">
                    <InfoField
                      icon={Tag}
                      label="Category"
                      value={categoryName}
                    />
                  </div>

                  <div className="p-4 sm:p-5 border-t border-gray-100">
                    <InfoField
                      icon={Clock}
                      label="Delivery Time"
                      value={
                        deliveryTime
                          ? `${deliveryTime} minutes`
                          : null
                      }
                    />
                  </div>

                  <div className="p-4 sm:p-5 sm:border-l border-gray-100 border-t">
                    <InfoField
                      icon={Truck}
                      label="Delivery Fee"
                      value={
                        deliveryFee !== null &&
                        deliveryFee !== undefined
                          ? `৳${deliveryFee}`
                          : null
                      }
                    />
                  </div>
                </div>
              </div>
            </section>



            {/* Metadata */}
            <section>
              <div className="flex items-center gap-2.5 mb-4">
                <CalendarDays
                  size={16}
                  className="text-[#532C89]"
                />

                <h3 className="text-[13px] font-bold text-gray-700">
                  Record Information
                </h3>

                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <InfoField
                    icon={CalendarDays}
                    label="Created"
                    value={formatDate(food.createdAt)}
                  />
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <InfoField
                    icon={CalendarDays}
                    label="Last Updated"
                    value={formatDate(food.updatedAt)}
                  />
                </div>

              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div
          className="
            flex
            flex-col-reverse
            sm:flex-row
            sm:items-center
            sm:justify-end
            gap-2.5
            px-5
            sm:px-7
            py-3.5
            border-t
            border-gray-100
            bg-gray-50/50
            shrink-0
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              w-full
              sm:w-auto
              px-5
              py-2.5
              border
              border-gray-300
              bg-white
              hover:bg-gray-50
              hover:border-gray-400
              text-gray-600
              hover:text-gray-800
              rounded-lg
              text-sm
              font-semibold
              transition-all
              cursor-pointer
            "
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(food);
            }}
            className="
              w-full
              sm:w-auto
              px-5
              py-2.5
              bg-[#1E293B]
              hover:bg-[#0f172a]
              text-white
              rounded-lg
              text-sm
              font-semibold
              transition-all
              cursor-pointer
              flex
              items-center
              justify-center
              gap-2
              shadow-sm
            "
          >
            <Pencil size={14} />
            Edit Food
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(8px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ViewFoodModal;