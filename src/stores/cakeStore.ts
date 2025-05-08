import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Cake {
  id: string
  name: string
  description: string
  price: number | { min: number; max: number; currency: string }
  imageUrl: string
  sizes?: { [key: string]: number }
}

interface Category {
  id: string
  name: string
  description: string
  imageUrl: string
  cakes: Cake[]
}

// Sample data
const sampleCategories: Category[] = [
  {
    id: '1',
    name: 'Birthday Cake',
    description: 'Celebrate birthdays with our custom-designed birthday cakes',
    imageUrl: '/categories/birthday.png',
    cakes: [
      {
            id: '1',
            name: 'Cocomelon',
            description: 'Rich chocolate cake with chocolate ganache',
            price: 1399,
            imageUrl: '/birthdays/1.png',

      },
      {
        id: '2',
        name: 'One Piece',
        description: 'Classic vanilla cake with buttercream frosting',
        price: 1499,
        imageUrl: '/birthdays/2.png'
      },
      {
        id: '3',
        name: 'Sofia The First',
        description: 'Colorful layers with rainbow frosting and sprinkles',
        price: {
          min: 999,
          max: 2399,
          currency: 'PHP'
          },
          sizes: {
              '6x6': 999,
              '7x6': 1299,
              '8x6': 1649,
              '9x6': 1949,
              '10x6': 2399
          },
        imageUrl: '/birthdays/3.png'
      },
      {
        id: '4',
        name: 'Emperador',
        description: 'Colorful layers with rainbow frosting and sprinkles',
        price: {
          min: 999,
          max: 2399,
          currency: 'PHP'
        },
        imageUrl: '/birthdays/4.png'
      },
      {
        id: '5',
        name: 'Barbie',
        description: 'Colorful layers with rainbow frosting and sprinkles',
        price: 1459,
        imageUrl: '/birthdays/5.png'
      },
      {
        id: '6',
        name: 'Dinosaur',
        description: 'Colorful layers with rainbow frosting and sprinkles',
        price: {
          min: 999,
          max: 2399,
          currency: 'PHP'
          },
          sizes: {
              '6x6': 999,
              '7x6': 1299,
              '8x6': 1649,
              '9x6': 1949,
              '10x6': 2399
          },
        imageUrl: '/birthdays/6.png'
      }
    ]
  },
  {
    id: '2',
    name: 'Wedding Cake',
    description: 'Elegant and sophisticated wedding cake designs for your special day',
    imageUrl: '/categories/wedding.png',
    cakes: [
      {
        id: '4',
        name: 'Royal Wedding',
        description: 'Elegant white cake with gold accents',
        price: 299.99,
        imageUrl: '/swiper/3.jpg'
      },
      {
        id: '5',
        name: 'Floral Elegance',
        description: 'Multi-tiered cake with sugar flowers and delicate details',
        price: 349.99,
        imageUrl: '/swiper/4.jpg'
      },
      {
        id: '6',
        name: 'Modern Minimalist',
        description: 'Clean design with geometric patterns and metallic accents',
        price: 279.99,
        imageUrl: '/swiper/5.jpg'
      }
    ]
  },
  {
    id: '3',
    name: 'Anniversary Cake',
    description: 'Commemorate your love story with our beautiful anniversary cakes',
    imageUrl: '/categories/anniversary.png',
    cakes: [
      {
        id: '7',
        name: 'Silver Anniversary',
        description: 'Silver-themed cake with elegant decorations',
        price: 199.99,
        imageUrl: '/swiper/4.jpg'
      },
      {
        id: '8',
        name: 'Golden Years',
        description: 'Gold-themed cake with romantic decorations',
        price: 219.99,
        imageUrl: '/swiper/5.jpg'
      },
      {
        id: '9',
        name: 'Love Story',
        description: 'Heart-shaped cake with personalized message',
        price: 189.99,
        imageUrl: '/swiper/3.jpg'
      }
    ]
  },
  {
    id: '4',
    name: 'Christening Cake',
    description: 'Celebrate your child\'s christening with our special christening cakes',
    imageUrl: '/categories/christening.png',
    cakes: [
      {
        id: '10',
        name: 'Angel\'s Blessing',
        description: 'White cake with angel decorations and cross design',
        price: 159.99,
        imageUrl: '/swiper/2.jpg'
      },
      {
        id: '11',
        name: 'Heavenly Delight',
        description: 'Blue and white cake with cloud decorations',
        price: 169.99,
        imageUrl: '/swiper/3.jpg'
      },
      {
        id: '12',
        name: 'Dove of Peace',
        description: 'White cake with dove decorations and religious symbols',
        price: 179.99,
        imageUrl: '/swiper/4.jpg'
      }
    ]
  }
]

export const useCakeStore = defineStore('cake', () => {
  // State
  const categories = ref<Category[]>(sampleCategories)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getCategoryById = computed(() => {
    return (id: string) => categories.value.find(category => category.id === id)
  })

  const getAllCategories = computed(() => categories.value)

  const getAllCakes = computed(() => {
    return categories.value.flatMap(category => category.cakes)
  })

  const getCakesByCategory = computed(() => {
    return (categoryId: string) => {
      const category = categories.value.find(c => c.id === categoryId)
      return category?.cakes || []
    }
  })

  // Actions
  function addCategory(category: Omit<Category, 'id' | 'cakes'>) {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      cakes: []
    }
    categories.value.push(newCategory)
  }

  function addCake(categoryId: string, cake: Omit<Cake, 'id'>) {
    const category = categories.value.find(c => c.id === categoryId)
    if (category) {
      const newCake: Cake = {
        ...cake,
        id: Date.now().toString()
      }
      category.cakes.push(newCake)
    }
  }

  function updateCategory(id: string, category: Partial<Omit<Category, 'cakes'>>) {
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      categories.value[index] = {
        ...categories.value[index],
        ...category
      }
    }
  }

  function updateCake(categoryId: string, cakeId: string, cake: Partial<Cake>) {
    const category = categories.value.find(c => c.id === categoryId)
    if (category) {
      const index = category.cakes.findIndex(c => c.id === cakeId)
      if (index !== -1) {
        category.cakes[index] = {
          ...category.cakes[index],
          ...cake
        }
      }
    }
  }

  function deleteCategory(id: string) {
    categories.value = categories.value.filter(c => c.id !== id)
  }

  function deleteCake(categoryId: string, cakeId: string) {
    const category = categories.value.find(c => c.id === categoryId)
    if (category) {
      category.cakes = category.cakes.filter(cake => cake.id !== cakeId)
    }
  }

  return {
    // State
    categories,
    loading,
    error,
    // Getters
    getCategoryById,
    getCakesByCategory,
    getAllCategories,
    getAllCakes,
    // Actions
    addCategory,
    addCake,
    updateCategory,
    updateCake,
    deleteCategory,
    deleteCake
  }
}) 