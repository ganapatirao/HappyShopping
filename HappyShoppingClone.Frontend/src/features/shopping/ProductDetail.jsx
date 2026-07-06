import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { productAPI, reviewAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Toast from '../shared/common/Toast';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Share2, 
  Truck, 
  ShieldCheck, 
  RefreshCw,
  ArrowLeft,
  Minus,
  Plus,
  MessageCircle,
  Check,
  Copy,
  X,
  ThumbsUp,
  MapPin,
  Clock,
  Tag,
  Award,
  Zap,
  Gift,
  Percent,
  Package,
  CreditCard,
  Repeat,
  ChevronRight,
  Info
} from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const reviewsRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [id]);

  const loadSimilarProducts = async () => {
    if (product?.similarProductIds && product.similarProductIds.length > 0) {
      try {
        const productPromises = product.similarProductIds.map(productId => 
          productAPI.getById(productId).catch(() => null)
        );
        const responses = await Promise.all(productPromises);
        const validProducts = responses
          .filter(response => response && response.data.success)
          .map(response => response.data.product);
        setSimilarProducts(validProducts);
      } catch (error) {
        console.error('Error loading similar products:', error);
      }
    }
  };

  const loadProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      if (response.data.success) {
        setProduct(response.data.product);
        // Set default variant if available
        if (response.data.product.variants && response.data.product.variants.length > 0) {
          setSelectedVariant(response.data.product.variants[0]);
          setSelectedColor(response.data.product.variants[0].color);
          if (response.data.product.variants[0].sizes && response.data.product.variants[0].sizes.length > 0) {
            setSelectedSize(response.data.product.variants[0].sizes[0]);
          }
        }
        // Load similar products
        loadSimilarProducts();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewAPI.getByProduct(id);
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
      
      const summaryResponse = await reviewAPI.getProductSummary(id);
      if (summaryResponse.data.success) {
        setReviewSummary(summaryResponse.data.summary);
      }
    } catch (error) {
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setToast({ show: true, message: 'Please login to add items to cart', type: 'error' });
      return;
    }

    if (!selectedVariant) {
      setToast({ show: true, message: 'Please select a variant', type: 'error' });
      return;
    }

    const productWithVariant = {
      ...product,
      selectedVariant,
      selectedColor,
      selectedSize,
      quantity
    };

    const result = await addToCart(productWithVariant, quantity);
    if (result.success) {
      setToast({ show: true, message: 'Added to cart successfully!', type: 'success' });
    } else {
      setToast({ show: true, message: result.message || 'Failed to add to cart', type: 'error' });
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      setToast({ show: true, message: 'Please login to add items to wishlist', type: 'error' });
      return;
    }

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const response = await userAPI.removeFromWishlist(user.id, product.id);
        if (response.data.success) {
          setIsWishlisted(false);
          setToast({ show: true, message: 'Removed from wishlist', type: 'success' });
        } else {
          setToast({ show: true, message: 'Failed to remove from wishlist', type: 'error' });
        }
      } else {
        // Add to wishlist
        const response = await userAPI.addToWishlist(user.id, { productId: product.id });
        if (response.data.success) {
          setIsWishlisted(true);
          setToast({ show: true, message: 'Added to wishlist', type: 'success' });
        } else {
          setToast({ show: true, message: 'Failed to add to wishlist', type: 'error' });
        }
      }
    } catch (error) {
      setToast({ show: true, message: 'Wishlist operation failed', type: 'error' });
    }
  };

  const handleColorSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedColor(variant.color);
    if (variant.sizes && variant.sizes.length > 0) {
      setSelectedSize(variant.sizes[0]);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const scrollToReviews = () => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareLinkCopied(true);
      setToast({ show: true, message: 'Link copied to clipboard!', type: 'success' });
      setTimeout(() => setShareLinkCopied(false), 2000);
    }).catch(() => {
      setToast({ show: true, message: 'Failed to copy link', type: 'error' });
    });
  };

  const handleSocialShare = (platform) => {
    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(`Check out this amazing product: ${product.name}`);
    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${shareText} ${shareUrl}`;
        break;
      case 'email':
        url = `mailto:?subject=Check out this product&body=${shareText} ${shareUrl}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      setToast({ show: true, message: 'Please login to submit a review', type: 'error' });
      return;
    }

    if (!reviewForm.title || !reviewForm.comment) {
      setToast({ show: true, message: 'Please fill in all review fields', type: 'error' });
      return;
    }

    try {
      const reviewData = {
        productId: id,
        userId: user.id,
        userName: user.name || user.email,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        color: selectedColor,
        size: selectedSize,
        isVerifiedPurchase: true
      };

      const response = await reviewAPI.create(reviewData);
      if (response.data.success) {
        setToast({ show: true, message: 'Review submitted successfully!', type: 'success' });
        setShowReviewModal(false);
        setReviewForm({ rating: 5, title: '', comment: '' });
        loadReviews();
      }
    } catch (error) {
      setToast({ show: true, message: 'Failed to submit review', type: 'error' });
    }
  };

  const handleMarkReviewHelpful = async (reviewId) => {
    try {
      await reviewAPI.markHelpful(reviewId, {});
      loadReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const currentOriginalPrice = product?.originalPrice || 0;
  const discountPercentage = currentOriginalPrice > 0 ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-16 z-40 bg-white/80 backdrop-blur-lg shadow-lg p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft size={24} />
          <span className="font-semibold">Back</span>
        </button>
      </div>

      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Product Images */}
          <div className="space-y-3 lg:space-y-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="relative aspect-square lg:aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={(product.imageBase64 || product.imageUrls)?.[selectedImage] || 'https://via.placeholder.com/600?text=Product'}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                {product.isPremierExclusive && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ Premier Exclusive
                  </div>
                )}
                {product.discountPercentage > 0 && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {product.discountPercentage}% OFF
                  </div>
                )}
              </div>
            </div>
            {(product.imageBase64 || product.imageUrls)?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {(product.imageBase64 || product.imageUrls).map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                      selectedImage === index 
                        ? 'border-purple-600 shadow-lg ring-2 ring-purple-200' 
                        : 'border-gray-200 hover:border-purple-400'
                    }`}
                  >
                    <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-16 lg:h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-3 lg:space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-4 lg:p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 leading-tight">{product.name}</h1>
                  <p className="text-gray-600 text-xs lg:text-sm">{product.description}</p>
                </div>
                <button
                  onClick={handleWishlistToggle}
                  className="ml-3 p-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Heart 
                    size={20} 
                    fill={isWishlisted ? 'currentColor' : 'none'} 
                    className={isWishlisted ? 'text-red-500' : 'text-gray-400'}
                  />
                </button>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-3 cursor-pointer" onClick={scrollToReviews}>
                <div className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full shadow-md">
                  <Star size={14} fill="currentColor" />
                  <span className="ml-1 font-bold text-sm">{product.rating?.toFixed(1) || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={14} 
                      fill={star <= Math.round(product.rating || 0) ? 'currentColor' : 'none'}
                      className="text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-gray-600 text-xs">({product.reviewCount || 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ₹{currentPrice.toLocaleString()}
                </span>
                <span className="text-lg lg:text-xl text-gray-400 line-through">₹{currentOriginalPrice.toLocaleString()}</span>
                {discountPercentage > 0 && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Color Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                    <span>Color:</span>
                    <span className="text-purple-600 font-bold">{selectedColor}</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => handleColorSelect(variant)}
                        className={`w-10 h-10 rounded-full border-3 transition-all hover:scale-110 ${
                          selectedColor === variant.color 
                            ? 'border-purple-600 ring-3 ring-purple-200 shadow-lg' 
                            : 'border-gray-300 hover:border-purple-400'
                        }`}
                        style={{ backgroundColor: variant.colorCode }}
                        title={variant.color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {selectedVariant?.sizes && selectedVariant.sizes.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                    <span>Size:</span>
                    <span className="text-purple-600 font-bold">{selectedSize}</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedVariant.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className={`px-4 py-2 border-2 rounded-xl font-bold transition-all hover:scale-105 text-sm ${
                          selectedSize === size 
                            ? 'border-purple-600 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                            : 'border-gray-300 hover:border-purple-400 text-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-4 lg:p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-purple-50 transition-colors bg-gray-50"
                  >
                    <Minus size={18} className="text-gray-600" />
                  </button>
                  <span className="px-4 py-2 font-bold text-lg text-gray-800 min-w-[50px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-purple-50 transition-colors bg-gray-50"
                  >
                    <Plus size={18} className="text-gray-600" />
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:via-pink-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base"
                >
                  <ShoppingCart size={20} />
                  <span>Add to Cart</span>
                </button>
              </div>
              
              <button
                onClick={handleWishlistToggle}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-sm ${
                  isWishlisted
                    ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-600 border-2 border-red-300'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-2 border-gray-300'
                }`}
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                <span>{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            {/* Delivery Info */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-4 lg:p-5 border border-blue-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base lg:text-lg">
                <Truck className="text-blue-600" size={20} />
                Delivery Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                    <Clock className="text-blue-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">
                      {product.deliveryInfo?.freeDelivery ? 'Free Delivery' : 'Delivery Charges Apply'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {product.deliveryInfo?.deliveryDays || 5} days ({product.deliveryInfo?.deliveryType || 'Standard'})
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                  <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                    <MapPin className="text-purple-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">Delivery Area</p>
                    <p className="text-xs text-gray-600">{product.deliveryInfo?.deliveryAreas || 'All India'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                  <div className="bg-orange-100 p-2 rounded-full flex-shrink-0">
                    <Repeat className="text-orange-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">
                      {product.deliveryInfo?.freeReturn ? 'Free Returns' : 'Return Policy'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {product.deliveryInfo?.returnDays || 7} days return
                    </p>
                  </div>
                </div>
                {product.deliveryInfo?.cashOnDeliveryAvailable && (
                  <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                    <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                      <CreditCard className="text-green-600" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">Cash on Delivery</p>
                      <p className="text-xs text-gray-600">Available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Share */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-4 lg:p-5 border border-purple-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base lg:text-lg">
                <Share2 className="text-purple-600" size={20} />
                Share this product
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                >
                  <Copy size={16} />
                  <span>{shareLinkCopied ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border-2 border-gray-200 font-semibold text-sm"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <div className="mt-6 lg:mt-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-4 lg:p-5 border border-yellow-100">
            <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-xl">
                <Zap className="text-white" size={18} />
              </div>
              Product Highlights
            </h3>
            <ul className="space-y-2">
              {product.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-2 rounded-full flex-shrink-0">
                    <Check className="text-white" size={14} />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Product Offers */}
        {product.offers && product.offers.length > 0 && (
          <div className="mt-6 lg:mt-8 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 rounded-2xl shadow-xl p-4 lg:p-5 border border-purple-100">
            <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                <Gift className="text-white" size={18} />
              </div>
              Available Offers
            </h3>
            <div className="space-y-3">
              {product.offers.map((offer, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-600 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-base">{offer.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{offer.description}</p>
                      {offer.validUntil && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock size={10} />
                          Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {offer.promoCode && (
                      <div className="ml-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-xl font-mono text-xs font-bold border border-purple-200">
                        {offer.promoCode}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-6 lg:mt-8 bg-white rounded-2xl shadow-xl p-4 lg:p-5 border border-gray-100">
            <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl">
                <Info className="text-white" size={18} />
              </div>
              Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex justify-between py-2 px-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-600 font-medium text-sm">{spec.key}</span>
                  <span className="font-bold text-gray-800 text-sm">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Product Info */}
        <div className="mt-6 lg:mt-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-xl p-4 lg:p-5 border border-orange-100">
          <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-xl">
              <Package className="text-white" size={18} />
            </div>
            Product Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {product.brand && (
              <div className="flex justify-between py-2 px-3 bg-white rounded-xl shadow-sm">
                <span className="text-gray-600 font-medium text-sm">Brand</span>
                <span className="font-bold text-gray-800 text-sm">{product.brand}</span>
              </div>
            )}
            {product.manufacturer && (
              <div className="flex justify-between py-2 px-3 bg-white rounded-xl shadow-sm">
                <span className="text-gray-600 font-medium text-sm">Manufacturer</span>
                <span className="font-bold text-gray-800 text-sm">{product.manufacturer}</span>
              </div>
            )}
            {product.countryOfOrigin && (
              <div className="flex justify-between py-2 px-3 bg-white rounded-xl shadow-sm">
                <span className="text-gray-600 font-medium text-sm">Country of Origin</span>
                <span className="font-bold text-gray-800 text-sm">{product.countryOfOrigin}</span>
              </div>
            )}
            {product.warranty && (
              <div className="flex justify-between py-2 px-3 bg-white rounded-xl shadow-sm">
                <span className="text-gray-600 font-medium text-sm">Warranty</span>
                <span className="font-bold text-gray-800 text-sm">{product.warranty}</span>
              </div>
            )}
            <div className="flex justify-between py-2 px-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600 font-medium text-sm">Stock</span>
              <span className={`font-bold text-sm ${selectedVariant?.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {selectedVariant?.stock > 0 ? `${selectedVariant.stock} available` : 'Out of Stock'}
              </span>
            </div>
            <div className="flex justify-between py-2 px-3 bg-white rounded-xl shadow-sm">
              <span className="text-gray-600 font-medium text-sm">Sold</span>
              <span className="font-bold text-gray-800 text-sm">{product.soldCount || 0} sold</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div ref={reviewsRef} className="mt-6 lg:mt-8 bg-white rounded-2xl shadow-xl p-4 lg:p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-xl">
                <Star className="text-white" size={18} />
              </div>
              Reviews & Ratings
            </h3>
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
            >
              <MessageCircle size={16} />
              <span>Write a Review</span>
            </button>
          </div>
          
          {/* Rating Summary */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="text-center md:text-left md:w-1/3">
              <div className="text-4xl font-bold text-gray-800">{reviewSummary?.averageRating?.toFixed(1) || product.rating?.toFixed(1) || 0}</div>
              <div className="flex text-yellow-400 justify-center md:justify-start my-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={16} fill={star <= Math.round(reviewSummary?.averageRating || product.rating || 0) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <p className="text-gray-600 text-sm">{reviewSummary?.totalReviews || product.reviewCount || 0} reviews</p>
            </div>
            <div className="flex-1">
              {reviewSummary?.ratingDistribution && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs w-6">5 ★</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${reviewSummary.totalReviews > 0 ? (reviewSummary.ratingDistribution.fiveStar / reviewSummary.totalReviews * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-10 text-right">{reviewSummary.totalReviews > 0 ? Math.round(reviewSummary.ratingDistribution.fiveStar / reviewSummary.totalReviews * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs w-6">4 ★</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${reviewSummary.totalReviews > 0 ? (reviewSummary.ratingDistribution.fourStar / reviewSummary.totalReviews * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-10 text-right">{reviewSummary.totalReviews > 0 ? Math.round(reviewSummary.ratingDistribution.fourStar / reviewSummary.totalReviews * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs w-6">3 ★</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${reviewSummary.totalReviews > 0 ? (reviewSummary.ratingDistribution.threeStar / reviewSummary.totalReviews * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-10 text-right">{reviewSummary.totalReviews > 0 ? Math.round(reviewSummary.ratingDistribution.threeStar / reviewSummary.totalReviews * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs w-6">2 ★</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${reviewSummary.totalReviews > 0 ? (reviewSummary.ratingDistribution.twoStar / reviewSummary.totalReviews * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-10 text-right">{reviewSummary.totalReviews > 0 ? Math.round(reviewSummary.ratingDistribution.twoStar / reviewSummary.totalReviews * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs w-6">1 ★</span>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${reviewSummary.totalReviews > 0 ? (reviewSummary.ratingDistribution.oneStar / reviewSummary.totalReviews * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-10 text-right">{reviewSummary.totalReviews > 0 ? Math.round(reviewSummary.ratingDistribution.oneStar / reviewSummary.totalReviews * 100) : 0}%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-3">
            {reviews.length > 0 ? (
              reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="border-b pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                      {review.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{review.userName}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={12} fill={star <= review.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                        {review.isVerifiedPurchase && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check size={8} />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {review.title && <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>}
                  <p className="text-gray-600 text-xs">{review.comment}</p>
                  {review.color && (
                    <p className="text-xs text-gray-500 mt-1">Color: {review.color} {review.size && `| Size: ${review.size}`}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleMarkReviewHelpful(review.id)}
                      className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
                    >
                      <ThumbsUp size={12} />
                      <span>Helpful ({review.helpfulCount || 0})</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-3 text-sm">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-6 lg:mt-8 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl shadow-xl p-4 lg:p-5 border border-teal-100">
            <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-xl">
                <Tag className="text-white" size={18} />
              </div>
              Similar Products
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
              {similarProducts.map((similarProduct) => (
                <div
                  key={similarProduct.id}
                  onClick={() => navigate(`/product/${similarProduct.id}`)}
                  className="cursor-pointer group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden mb-2 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                      <img
                        src={(similarProduct.imageBase64 || similarProduct.imageUrls)?.[0] || 'https://via.placeholder.com/200?text=Product'}
                        alt={similarProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {similarProduct.discountPercentage > 0 && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {similarProduct.discountPercentage}% OFF
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-800 text-xs lg:text-sm truncate group-hover:text-purple-600 transition-colors">{similarProduct.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-purple-600 font-bold text-sm lg:text-base">₹{similarProduct.price.toLocaleString()}</p>
                    {similarProduct.originalPrice > similarProduct.price && (
                      <p className="text-xs text-gray-400 line-through">₹{similarProduct.originalPrice.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Review Modal */}
    {showReviewModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100">
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                  <Star className="text-white" size={24} />
                </div>
                Write a Review
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={28} />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Rating</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="text-3xl hover:scale-110 transition-transform"
                    >
                      <Star
                        size={32}
                        fill={star <= reviewForm.rating ? 'currentColor' : 'none'}
                        className={star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Review Title</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Summarize your review"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Review</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-32 resize-none"
                  placeholder="Share your experience with this product"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleReviewSubmit}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-bold"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all font-bold border-2 border-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Share Modal */}
    {showShareModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100">
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                  <Share2 className="text-white" size={24} />
                </div>
                Share Product
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={28} />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={handleShare}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <button onClick={() => handleSocialShare('facebook')} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-1">
                  <span className="text-xs font-bold">Facebook</span>
                </button>
                <button onClick={() => handleSocialShare('twitter')} className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-4 rounded-xl hover:from-sky-600 hover:to-sky-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-1">
                  <span className="text-xs font-bold">Twitter</span>
                </button>
                <button onClick={() => handleSocialShare('whatsapp')} className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-1">
                  <span className="text-xs font-bold">WhatsApp</span>
                </button>
                <button onClick={() => handleSocialShare('email')} className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-1">
                  <span className="text-xs font-bold">Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    <Toast
      show={toast.show}
      onClose={() => setToast({ ...toast, show: false })}
      message={toast.message}
      type={toast.type}
    />
    </>
  );
};

export default ProductDetailPage;
