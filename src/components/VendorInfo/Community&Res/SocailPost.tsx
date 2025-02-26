"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, UserPlus, Check } from "lucide-react"

interface ListItem {
  id: string
  name: string
  subtitle: string
  avatar: string
  isFollowing: boolean
}

interface Section {
  title: string
  items: ListItem[]
}

const initialSections: Section[] = [
  {
    title: "VENDORS",
    items: [
      {
        id: "1",
        name: "Taiwo Abdulazeez",
        subtitle: "Beauty and SkinCare",
        avatar: "/placeholder.svg?height=40&width=40",
        isFollowing: true,
      },
      {
        id: "2",
        name: "James Charlton",
        subtitle: "Fashion",
        avatar: "/placeholder.svg?height=40&width=40",
        isFollowing: false,
      },
      {
        id: "3",
        name: "Anya Gerald",
        subtitle: "Arts and Culture",
        avatar: "/placeholder.svg?height=40&width=40",
        isFollowing: false,
      },
      {
        id: "4",
        name: "Jeff Mikeal",
        subtitle: "Furnitures",
        avatar: "/placeholder.svg?height=40&width=40",
        isFollowing: false,
      },
    ],
  },
  {
    title: "COMMUNITY",
    items: [
      {
        id: "5",
        name: "Mbayy",
        subtitle: "",
        avatar: "/placeholder.svg?height=40&width=40",
        isFollowing: true,
      },
      {
        id: "6",
        name: "3D Blender",
        subtitle: "",
        avatar: "/placeholder.svg?height=40&width=40",
        isFollowing: false,
      },
      {
        id: "7",
        name: "Arab Dresses Ideas",
        subtitle: "",
        avatar: "/placeholder.svg?height=40&width=40",
        isFollowing: false,
      },
      {
        id: "8",
        name: "Photography",
        subtitle: "",
        avatar: "/placeholder.svg?height=40&width=40",
        isFollowing: true,
      },
    ],
  },
  {
    title: "FOLLOWING",
    items: [
      {
        id: "9",
        name: "Mbayy",
        subtitle: "",
        avatar: "/placeholder.svg?height=40&width=40",
        isFollowing: true,
      },
      {
        id: "10",
        name: "Photography",
        subtitle: "",
        avatar: "/placeholder.svg?height=40&width=40",
        isFollowing: true,
      },
      {
        id: "11",
        name: "Taiwo Abdulazeez",
        subtitle: "Beauty and SkinCare",
        avatar: "/placeholder.svg?height=40&width=40",
        isFollowing: true,
      },
    ],
  },
]

export default function SocialList() {
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [searchQuery, setSearchQuery] = useState("")
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleFollow = (sectionIndex: number, itemId: string) => {
    setSections(
      sections.map((section, idx) =>
        idx === sectionIndex
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, isFollowing: !item.isFollowing } : item,
              ),
            }
          : section,
      ),
    )
  }

  const filteredSections = sections.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  }))

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = scrollContainerRef.current
      if (scrollContainer) {
        const isScrolled = scrollContainer.scrollTop > 0
        scrollContainer.classList.toggle("shadow-inner", isScrolled)
      }
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  return (
    <div className="max-w-md mx-auto bg-white h-screen flex flex-col">
      <div className="p-4 bg-white">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search People or Group"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 transition-shadow duration-300"
      >
        {filteredSections.map((section, sectionIndex) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-gray-500 mb-3 sticky top-0 bg-white py-2">{section.title}</h2>
            <motion.div layout className="space-y-4">
              <AnimatePresence>
                {section.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={item.avatar || "/placeholder.svg"} alt="" className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        {item.subtitle && <p className="text-xs text-gray-500">{item.subtitle}</p>}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFollow(sectionIndex, item.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                        item.isFollowing ? "bg-gray-100 text-gray-700" : "bg-blue-500 text-white"
                      }`}
                    >
                      {item.isFollowing ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}

