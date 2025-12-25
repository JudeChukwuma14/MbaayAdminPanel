import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useQuery } from "@tanstack/react-query";
import { get_single_vendor } from "@/utils/vendorApi";

interface SubSubCategory {
  name: string;
}

interface SubCategory {
  name: string;
  subSubCategories: SubSubCategory[];
}

interface MainCategory {
  name: string;
  subCategories: SubCategory[];
}

interface CategorySelectorProps {
  selectedCategories: string[];
  activeCategory: string;
  handleCategoryChange: (category: string) => void;
  vendorPlan?: "Starter" | "Shelves" | "Counter" | "Shop" | "Premium";
  selectedSubCategory: string;
  setSelectedSubCategory: (subCategory: string) => void;
  selectedSubSubCategory: string;
  setSelectedSubSubCategory: (subSubCategory: string) => void;
  categoryData?: MainCategory[];
  onCategorySelect?: (category: string) => void;
}

export default function CategorySelector({
  selectedCategories,
  activeCategory,
  handleCategoryChange,
  vendorPlan = "Starter",
  selectedSubCategory,
  setSelectedSubCategory,
  selectedSubSubCategory,
  setSelectedSubSubCategory,
  onCategorySelect,
  categoryData = [
    //Beauty and Wellness
    {
      name: "Beauty and Wellness",
      subCategories: [
        {
          name: "Skincare",
          subSubCategories: [
            { name: "Natural Soaps" },
            { name: "Body Butters" },
            { name: "Face Masks" },
            { name: "Facial Oils and Serums" },
            { name: "Scrubs and Exfoliants" },
          ],
        },
        {
          name: "Haircare",
          subSubCategories: [
            { name: "Natural Shampoos and Conditioners" },
            { name: "Hair Oils and Treatments" },
            { name: "Herbal Hair Masks" },
            { name: "Combs and Brushes" },
            { name: "Scalp Treatments" },
          ],
        },
        {
          name: "Body Care",
          subSubCategories: [
            { name: "Herbal Bath Products" },
            { name: "Body Lotions and Creams" },
            { name: "Deodorants and Antiperspirants" },
            { name: "Sunscreens and Sunblocks" },
          ],
        },
        {
          name: "Makeup",
          subSubCategories: [
            { name: "Natural Foundations and Powders" },
            { name: "Lip Balms and Lipsticks" },
            { name: "Eye Makeup" },
            { name: "Blushes and Bronzers" },
          ],
        },
        {
          name: "Fragrances",
          subSubCategories: [
            { name: "Essential Oils" },
            { name: "Natural Perfumes" },
            { name: "Incense and Smudge Sticks" },
            { name: "Scented Candles" },
          ],
        },
        {
          name: "Wellness Products",
          subSubCategories: [
            { name: "Herbal Teas" },
            { name: "Tinctures and Tonics" },
            { name: "Essential Oil Blends" },
            { name: "Herbal Supplements" },
            { name: "Massage Oils and Balms" },
          ],
        },
        {
          name: "Men's Grooming",
          subSubCategories: [
            { name: "Beard Oils and Balms" },
            { name: "Shaving Creams and Soaps" },
            { name: "Aftershave and Toners" },
            { name: "Hair Pomades and Waxes" },
            { name: "Body Washes and Scrubs" },
          ],
        },
        {
          name: "Baby and Child Care",
          subSubCategories: [
            { name: "Natural Baby Lotions" },
            { name: "Baby Bath Products" },
            { name: "Diaper Balms" },
            { name: "Baby Oils" },
            { name: "Baby Powders" },
          ],
        },
        {
          name: "Health and Wellness Kits",
          subSubCategories: [
            { name: "Detox Kits" },
            { name: "Spa Kits" },
            { name: "Sleep and Relaxation Kits" },
          ],
        },
        {
          name: "Immunity Boost Kits",
          subSubCategories: [
            { name: "Sustainable and Eco-friendly Products" },
            { name: "Reusable makeup Remover Pads" },
            { name: "Natural and Biodegradable Packaging" },
            { name: "Zero Waste Beauty Kits" },
          ],
        },
      ],
    },
    //Jewelry and Gemstones
    {
      name: "Jewelry and Gemstones",
      subCategories: [
        {
          name: "Handmade Jewelry",
          subSubCategories: [
            { name: "Necklaces" },
            { name: "Bracelets" },
            { name: "Rings" },
            { name: "Earrings" },
            { name: "Anklets" },
            { name: "Brooches & Pins" },
            { name: "Custom Jewelry" },
          ],
        },
        {
          name: "Gemstones",
          subSubCategories: [
            { name: "Precious Gemstones" },
            { name: "Semi-precious Gemstones" },
            { name: "Raw Gemstones" },
            { name: "Cut & Polished Gemstones" },
            { name: "Gemstone Beads" },
          ],
        },
        {
          name: "Jewelry Materials",
          subSubCategories: [
            { name: "Metal Jewelry" },
            { name: "Beadwork Jewelry" },
            { name: "Wire Jewelry" },
            { name: "Leather Jewelry" },
            { name: "Wooden Jewelry" },
            { name: "Personalized & Custom Orders" },
          ],
        },
        {
          name: "Ethically Sourced & Sustainable Jewelry",
          subSubCategories: [
            { name: "Recycled Materials Jewelry" },
            { name: "Conflict-free Gemstones" },
          ],
        },
        {
          name: "Men's Jewelry",
          subSubCategories: [
            { name: "Men's Bracelets" },
            { name: "Men's Rings" },
            { name: "Men's Necklaces" },
            { name: "Men's Earrings" },
          ],
        },
        {
          name: "Children's Jewelry",
          subSubCategories: [
            { name: "Kids' Bracelets" },
            { name: "Kids' Necklaces" },
            { name: "Charm jewelry for Kids" },
          ],
        },
        {
          name: "Bridal & Special Occasion Jewelry",
          subSubCategories: [
            { name: "Engagement Rings" },
            { name: "Wedding Bands" },
            { name: "Bridal Sets" },
            { name: "Prom & Homecoming Jewelry" },
            { name: "Anniversary Jewelry" },
          ],
        },
        {
          name: "Cultural & traditional Jewelry",
          subSubCategories: [
            { name: "African Jewelry" },
            { name: "Asian Jewelry" },
            { name: "Native/Indigenous Jewelry" },
          ],
        },
        {
          name: "Gemstone jewelry by Birthstone",
          subSubCategories: [
            { name: "January (Garnet)" },
            { name: "February (Amethyst)" },
            { name: "March (Aqumarine)" },
            { name: "April (Diamond)" },
            { name: "May (Emerald)" },
            { name: "June (Pearl, Moonstone)" },
            { name: "July (Ruby)" },
            { name: "August (Peridot)" },
            { name: "September (Sapphire)" },
            { name: "October (Opal, Tourmaline)" },
            { name: "November (Topaz, Citrine)" },
            { name: "December (Turquoise, Zircon)" },
          ],
        },
      ],
    },
    //Books and Poetry
    {
      name: "Books and Poetry",
      subCategories: [
        {
          name: "Cultural and Ethnic Studies",
          subSubCategories: [
            { name: "Books on Indigenous Cultures" },
            { name: "Ethnographic Studies" },
            { name: "African, Asian, and Native American Heritage" },
            { name: "Cultural Identity and Diaspora Experiences" },
          ],
        },
        {
          name: "Traditional and Folk Literature",
          subSubCategories: [
            { name: "Folktales and Myths from Various Regions" },
            { name: "Oral Traditions and Storytelling" },
            { name: "Epic Poems and Legendary Tales" },
            { name: "Traditional Proverbs and Sayings" },
          ],
        },
        {
          name: "Poetry",
          subSubCategories: [
            { name: "Indigenous and Tribal Poetry" },
            { name: "Contemporary Poems by Diaspora Writers" },
            { name: "Traditional Poetic Forms (Haiku, Ghazal)" },
            { name: "Bilingual Poetry Collections" },
            { name: "Poetry about Migration and Identity" },
          ],
        },
        {
          name: "Historical Narratives",
          subSubCategories: [
            { name: "history of Indigenous Peoples" },
            { name: "biographies of cultural leaders" },
            { name: "books on colonial and Post-colonial history" },
            { name: "migration and diaspora stories" },
            { name: "historical fiction with cultural themes" },
          ],
        },
        {
          name: "Art and Craft",
          subSubCategories: [
            { name: "Traditional Handicrafts and Techniques" },
            { name: "Indigenous Art Forms" },
            { name: "Textile and Fabric Art Books" },
            { name: "Books on Pottery, Weaving, and Embroidery" },
          ],
        },
        {
          name: "Spiritual and Religious",
          subSubCategories: [
            { name: "Sacred Texts and Commentaries" },
            { name: "Books on Traditional Spiritual Practices" },
            { name: "Mysticism and Folk Religions" },
            { name: "Books on Religious Rituals and Ceremonies" },
            { name: "Poetry with Spiritual Themes" },
          ],
        },
        {
          name: "Language and Linguistics",
          subSubCategories: [
            { name: "Books on Endangered Languages" },
            { name: "Indigenous Language Learning Materials" },
            { name: "Bilingual and Multilingual Literature" },
            { name: "Studies on Dialects and Regional languages" },
          ],
        },
        {
          name: "Cookbooks and Culinary traditions",
          subSubCategories: [
            { name: "Traditional Recipes from various Cultures" },
            { name: "Books on Indigenous Ingredients" },
            { name: "Culinary Histories and Food Cultures" },
            { name: "Cultural Significance of Food in Diaspora Communities" },
            { name: "Poetry about Food and Eating" },
          ],
        },
        {
          name: "Children's Books",
          subSubCategories: [
            { name: "Bilingual Storybooks" },
            { name: "Folktales and Legends for Children" },
            { name: "Cultural Identity Books for Kids" },
            { name: "Illustrated Books on Traditional Stories" },
            { name: "Poetry Collections for Children" },
          ],
        },
        {
          name: "Travel and Exploration",
          subSubCategories: [
            { name: "Travel Guides to Indigenous and Remote Regions" },
            { name: "Ethnographic Travel Narratives" },
            { name: "Books on Cultural Etiquette and Traditions" },
            { name: "Adventure and Exploration Stories from Home Countries" },
          ],
        },
        {
          name: "Health and Wellness",
          subSubCategories: [
            { name: "Books on Traditional Healing Practices" },
            { name: "Indigenous Herbal Medicine" },
            { name: "Yoga and Meditation Guides from Cultural Perspectives" },
            { name: "Wellness Poetry and Spiritual Healing" },
          ],
        },
        {
          name: "Political and Social Issues",
          subSubCategories: [
            { name: "Books on Indigenous Rights and Social Justice" },
            { name: "Studies on Migration and Displacement" },
            { name: "Books on Identity Politics and Ethnic Studies" },
            { name: "Poetry Addressing Social Issues and Activism" },
          ],
        },
        {
          name: "Artistic and Creative Writing",
          subSubCategories: [
            { name: "Anthologies of Short Stories and Essays" },
            { name: "Experimental and Avant-garde Poetry" },
            { name: "Books on Creative Writing with Cultural Themes" },
            { name: "Books on the Craft of Writing Poetry" },
          ],
        },
        {
          name: "Environmental and Nature Studies",
          subSubCategories: [
            { name: "Indigenous Environmental Practices and Sustainability" },
            { name: "Books on Traditional Agriculture" },
            { name: "Poetry Celebrating Nature and the Environment" },
            { name: "Studies on Sacred Landscapes and Biodiversity" },
          ],
        },
        {
          name: "Inspirational and Motivational Books",
          subSubCategories: [
            { name: "Stories of Resilience and Overcoming Challenges" },
            { name: "Books on Empowerment from Cultural Perspectives" },
            { name: "Motivational Poetry and Speeches" },
            { name: "Wisdom Literature and Ethical Teachings" },
          ],
        },
      ],
    },
    //Vintage Stocks
    {
      name: "Vintage Stocks",
      subCategories: [
        {
          name: "Vintage Textiles and Fabrics",
          subSubCategories: [
            { name: "Handwoven Kente Cloth" },
            { name: "Vintage Ikat Fabrics" },
            { name: "Traditional Batik Prints" },
            { name: "Hand-embroidered Shawls" },
            { name: "Vintage Kilim Rugs" },
          ],
        },
        {
          name: "Vintage Clothing",
          subSubCategories: [
            { name: "Traditional Kimonos" },
            { name: "African Dashikis" },
            { name: "Indian Sarees" },
            { name: "Middle Eastern Kaftans" },
            { name: "Vintage Ponchos" },
          ],
        },
        {
          name: "Vintage Home Decor",
          subSubCategories: [
            { name: "Hand-carved Wooden Masks" },
            { name: "Antique Ceramics and Pottery" },
            { name: "Vintage Woven Baskets" },
            { name: "Ethnic Wall Hangings" },
            { name: "Vintage Brass Candle Holders" },
          ],
        },
        {
          name: "Vintage Instruments",
          subSubCategories: [
            { name: "African Djembe Drums" },
            { name: "Indian Sitars" },
            { name: "Middle Eastern Ouds" },
            { name: "Asian Bamboo Flutes" },
            { name: "Native American Flutes" },
          ],
        },
        {
          name: "Vintage Art",
          subSubCategories: [
            { name: "Hand-painted Miniatures" },
            { name: "Traditional Tapestries" },
            { name: "Vintage Tribal Artworks" },
            { name: "Ethnic Paintings" },
            { name: "Indigenous Sculptures" },
          ],
        },
        {
          name: "Vintage Furniture",
          subSubCategories: [
            { name: "Handcrafted Wooden Chests" },
            { name: "Vintage Wicker Chairs" },
            { name: "Antique Wooden Benches" },
            { name: "Traditional Stools" },
            { name: "Hand-carved Coffee Tables" },
          ],
        },
        {
          name: "Vintage Handicrafts",
          subSubCategories: [
            { name: "Woven Dreamcatchers" },
            { name: "Hand-carved Totem Poles" },
            { name: "Traditional Puppets" },
            { name: "Vintage Clay Figurines" },
            { name: "Hand-painted Gourds" },
          ],
        },
        {
          name: "Vintage Religious and Spiritual Items",
          subSubCategories: [
            { name: "Antique Prayer Beads" },
            { name: "Vintage Incense Burners" },
            { name: "Old Religious Icons" },
            { name: "Vintage Crosses and Crucifixes" },
            { name: "Sacred Text Reproductions" },
          ],
        },
        {
          name: "Vintage Storage",
          subSubCategories: [
            { name: "Handcrafted Wooden Trunks" },
            { name: "Vintage Leather Bags" },
            { name: "Antique Jewelry Boxes" },
            { name: "Handwoven Baskets" },
            { name: "Vintage Ceramic Jars" },
          ],
        },
      ],
    },
    //Home Décor and Accessories
    {
      name: "Home Décor and Accessories",
      subCategories: [
        {
          name: "Textiles and Fabrics",
          subSubCategories: [
            { name: "Handwoven Rugs(e.g., Kilim, Dhurrie)" },
            { name: "Embroidered Cushion Covers" },
            { name: "Hand-dyed Batik Throws" },
            { name: "Traditional Quilts" },
            { name: "Handwoven Blankets and Shawls" },
          ],
        },
        {
          name: "Ceramics and Pottery",
          subSubCategories: [
            { name: "Hand-painted Ceramic Bowls" },
            { name: "Earthenware Vases" },
            { name: "Traditional Clay Cooking Pots" },
            { name: "Decorative Terracotta Planters" },
            { name: "Handcrafted Ceramic Tableware" },
          ],
        },
        {
          name: "Wood Craft",
          subSubCategories: [
            { name: "Hand-carved Wooden Bowls" },
            { name: "Traditional Wooden Masks" },
            { name: "Ornate Wooden Wall Art" },
            {
              name: "Handcrafted Wooden Furniture(e.g., stools, side tables)",
            },
            { name: "Wooden Picture Frames" },
          ],
        },
        {
          name: "Metalwork",
          subSubCategories: [
            { name: "Hand-forged Iron Candle Holders" },
            { name: "Copper and Brass Wall Hangings" },
            { name: "Metal Trays with Intricate Designs" },
            { name: "Handcrafted Lanterns" },
            { name: "Sculpted Metal Figurines" },
          ],
        },
        {
          name: "Baskets and Weaving",
          subSubCategories: [
            { name: "Handwoven Storage Baskets" },
            { name: "Decorative Wicker Baskets" },
            { name: "Palm Leaf Trays" },
            { name: "Woven Wall Art" },
            { name: "Traditional Market Baskets" },
          ],
        },
        {
          name: "Glasswork",
          subSubCategories: [
            { name: "Blown Glass Vases" },
            { name: "Stained Glass Window Hangings" },
            { name: "Glass Bead Curtains" },
            { name: "Mosaic Glass Bowls" },
            { name: "Handcrafted Glass Candle Holders" },
          ],
        },
        {
          name: "Leather Woods",
          subSubCategories: [
            { name: "Hand-stitched Leather Poufs" },
            { name: "Leather Wall Hangings" },
            { name: "Decorative Leather Storage Boxes" },
            { name: "Handcrafted Leather Coasters" },
            { name: "Leather-bound Journals" },
          ],
        },
        {
          name: "Beaded Decor",
          subSubCategories: [
            { name: "Beaded Wall Hangings" },
            { name: "Beaded Coasters" },
            { name: "Beaded Table Runners" },
            { name: "Decorative Beaded Mirrors" },
            { name: "Handcrafted Beaded Lampshades" },
          ],
        },
        {
          name: "Stone and Marble Crafts",
          subSubCategories: [
            { name: "Hand-carved Marble Coasters" },
            { name: "Stone Sculptures" },
            { name: "Marble Candle Holders" },
            { name: "Stone Planters" },
            { name: "Decorative Stone Tiles" },
          ],
        },
        {
          name: "Handcrafted Lamps and Lighting",
          subSubCategories: [
            { name: "Bamboo and Rattan Lampshades" },
            { name: "Handwoven Lanterns" },
            { name: "Beaded Chandelier" },
            { name: "Ceramic Table Lamps" },
            { name: "Wooden Floor Lamps" },
          ],
        },
        {
          name: "Wall Art",
          subSubCategories: [
            { name: "Tapestries with Traditional Motifs" },
            { name: "Hand-painted Murals on Canvas" },
            { name: "Tribal Masks and Shields" },
            { name: "Wooden Wall Panels" },
            { name: "Metal Wall Sculptures" },
          ],
        },
        {
          name: "Jewelry and Trinket Boxes",
          subSubCategories: [
            { name: "Hand-carved Wooden Jewelry Boxes" },
            { name: "Decorative Ceramic Trinket Dishes" },
            { name: "Beaded Jewelry Organizers" },
            { name: "Hand-painted Keepsake Boxes" },
            { name: "Embroidered Fabric Jewelry Rolls" },
          ],
        },
        {
          name: "Mirrors",
          subSubCategories: [
            { name: "Hand-carved Wooden Mirrors" },
            { name: "Decorative Metal Mirrors" },
            { name: "Mosaic Mirrors" },
            { name: "Beaded Frame Mirrors" },
            { name: "Embossed Leather Mirrors" },
          ],
        },
        {
          name: "Handwoven Mats and Carpets",
          subSubCategories: [
            { name: "Sisal Mats" },
            { name: "Wool Rugs with Ethnic Patterns" },
            { name: "Cotton Dhurries" },
            { name: "Bamboo Mats" },
            { name: "Silk Carpets" },
          ],
        },
        {
          name: "Handcrafted Kitchenware",
          subSubCategories: [
            { name: "Wooden Serving Trays" },
            { name: "Hand-thrown Clay Pots" },
            { name: "Carved Wooden Utensils" },
            { name: "Handwoven Table Mats" },
            { name: "Ceramic Mugs and Cups" },
          ],
        },
      ],
    },
    //Plant and Seeds
    {
      name: "Plant and Seeds",
      subCategories: [
        {
          name: "Plants",
          subSubCategories: [
            { name: "Indoor Plants" },
            { name: "Succulents" },
            { name: "Air Plants" },
            { name: "Potted Herbs" },
            { name: "Tropical Houseplants" },
            { name: "Outdoor Plants" },
            { name: "Perennials" },
            { name: "Shrubs and Bushes" },
            { name: "Climbing Plants" },
            { name: "Garden Flowers" },
          ],
        },
        {
          name: "Fruit Plants",
          subSubCategories: [
            { name: "Berry Bushes" },
            { name: "Exotic Fruits" },
            { name: "Citrus Trees" },
            { name: "Exotic Fruit Plants" },
          ],
        },
        {
          name: "Vegetable Plants",
          subSubCategories: [
            { name: "Tomato Plants" },
            { name: "Pepper Plants" },
            { name: "Leafy Greens" },
            { name: "Root Vegetables" },
          ],
        },
        {
          name: "Medicinal Plants",
          subSubCategories: [
            { name: "Aloe Vera" },
            { name: "Neem" },
            { name: "Holy Basil(Tulsi)" },
            { name: "Echinacea" },
          ],
        },
        {
          name: "Seeds",
          subSubCategories: [
            { name: "Vegetable Seeds" },
            { name: "Leafy Greens" },
            { name: "Root Vegetables" },
            { name: "Heirloom Varieties" },
            { name: "Rare and Exotic Vegetables" },
            { name: "Fruit Seeds" },
            { name: "Melons and Gourds" },
            { name: "Berries" },
            { name: "Exotic Fruits" },
            { name: "Citrus Seeds" },
          ],
        },
        {
          name: "Herb Seeds",
          subSubCategories: [
            { name: "Culinary Herbs(Basil, Thyme)" },
            { name: "Medicinal Herbs(Moringa, Ashwagandha" },
            { name: "Aromatic Herbs(Lemongrass, Mint" },
          ],
        },
        {
          name: "Flower Seeds",
          subSubCategories: [
            { name: "Annual Flowers" },
            { name: "Perennial Flowers" },
            { name: "Edible Flowers" },
            { name: "Wildflower Seeds" },
          ],
        },
        {
          name: "Cultural and Traditional Seeds",
          subSubCategories: [
            { name: "Indigenous Crop Seeds(Millet, Sorghum)" },
            { name: "Heritage Seeds" },
            { name: "Ceremonial and Ritual Seeds" },
          ],
        },
        {
          name: "Seedlings and Saplings",
          subSubCategories: [
            { name: "Tree Saplings" },
            { name: "Native Trees" },
            { name: "Fruit Tree Saplings" },
            { name: "Shade Trees" },
            { name: "Herb Seedlings" },
            { name: "Culinary Herb Seedlings" },
            { name: "Medicinal Herb Seedlings" },
            { name: "Vegetable Seedlings" },
            { name: "Starter Plants" },
            { name: "Grafted Vegetables" },
            { name: "Flower Seedlings" },
            { name: "Wildflower Seedlings" },
            { name: "Ornamental Flower Seedlings" },
          ],
        },
        {
          name: "Planting Kits and Tools",
          subSubCategories: [
            { name: "Seed Starter Kits" },
            { name: "Herb Growing Kits" },
            { name: "Vegetable Garden Kits" },
            { name: "Indoor Garden Kits" },
            { name: "Planting Tools" },
            { name: "Hand Tools" },
            { name: "Planters and Pots" },
            { name: "Soil and Fertilizers" },
          ],
        },
        {
          name: "Plant Care Products",
          subSubCategories: [
            { name: "Soil Mixes" },
            { name: "Organic Soil Mixes" },
            { name: "Specialized Soil(e.g., Cactus Soil)" },
            { name: "Fertilizers and Nutrients" },
            { name: "Organic Fertilizers" },
            { name: "Specialty Plant Nutrients" },
            { name: "Pest Control" },
            { name: "Natural Pest Control Products" },
            { name: "Companion Plants for Pest Control" },
          ],
        },
      ],
    },
    //Spices, Condiments and Seasonings
    {
      name: "Spices, Condiments and Seasonings",
      subCategories: [
        {
          name: "Spices",
          subSubCategories: [
            { name: "Whole Spices(Ungrounded Spice)" },
            { name: "Ground Spices(Powdery Form)" },
            {
              name: "Spice Blends & Mixes(e.g., Curry Powder, Garam Masala, Chili Powder)",
            },
            {
              name: "Specialty & Exotic Spices(e.g., Saffron, Sumac, Za'atar, Star Anise)",
            },
            { name: "Organic Spices(Certified Organic options)" },
            { name: "Dried Herbs(e.g., Oregano, Thyme, Basil, Rosemary)" },
          ],
        },
        {
          name: "Condiments",
          subSubCategories: [
            { name: "Sauces(e.g., Hot Sauces, Soy Sauce, Barbecue Sauce)" },
            {
              name: "Vinegars & Cooking Wines(e.g., Apple Cider Vinegar, Balsamic Vinegar, Rice Wine Vinegar)",
            },
            {
              name: "Mustards & Ketchups(e.g., Dijon Mustard, Whole Grain Mustard, Organic Ketchup)",
            },
            {
              name: "Relishes & Pickles(e.g., Mango Pickle, Dill Pickles, Sweet Relish)",
            },
            {
              name: "Chutneys & Preserves(e.g., Mango Chutney, Tamarind Chutney)",
            },
            {
              name: "Honey & Syrups(e.g., Local Honey, Maple Syrup, Agave Syrup)",
            },
          ],
        },
        {
          name: "Cultural & Regional Spices",
          subSubCategories: [
            {
              name: "African Spices(e.g., Berbere, Ras el Hanout, Suya Spice)",
            },
            {
              name: "Asian Spices(e.g., Chinese Five Spice, Indian Masalas, Japanese Shichimi)",
            },
            { name: "Middle Eastern Spices(e.g., Baharat, Dukkah, Za'atar)" },
            {
              name: "Latin American Spices(e.g., Achiote, Ancho Chili Powder, Adobo Seasoning)",
            },
            {
              name: "European Spices(e.g., Italian Herbs, Herbes de Provence, Smoked Paprika)",
            },
          ],
        },
        {
          name: "Salt & Pepper Varieties",
          subSubCategories: [
            {
              name: "Artisan Salts(e.g., Himalayan Pink Salt, Black Lava Salt, Fleur de Sel)",
            },
            {
              name: "Pepper Varieties(e.g., Black Pepper, White Pepper, Sichuan Peppercorns)",
            },
            {
              name: "Smoked Salts & Peppers(e.g., Smoked Sea Salt, Smoked Paprika)",
            },
          ],
        },
        {
          name: "Marinades & Rubs",
          subSubCategories: [
            {
              name: "Meat Rubs(e.g., Barbecue Rubs, Cajun Rubs, Jerk Seasoning)",
            },
            {
              name: "Fish & Seafood Marinades(e.g., Lemon & Herb Marinades, Creole Seasoning)",
            },
            {
              name: "Vegetable & Vegan Marinades(e.g., Tandoori Marinades, Harissa Paste)",
            },
          ],
        },
        {
          name: "Health & Wellness Spices",
          subSubCategories: [
            { name: "Ayurvedic Spices(e.g., Turmeric, Ashwagandha, Ginger)" },
            { name: "Herbal Supplements(e.g., Moringa, Holy Basil)" },
            {
              name: "Medicinal Blends(e.g., Golden Milk Blends, Herbal Teas)",
            },
          ],
        },
        {
          name: "Spice Kits & Gift Sets",
          subSubCategories: [
            {
              name: "Regional Spice Kits(e.g., Indian Cooking Spice Kits, Mediterranean Spice Kits)",
            },
            {
              name: "Gift Sets(e.g., Gourmet Spice Gift Sets, Hot Sauce Gift Packs)",
            },
          ],
        },
        {
          name: "Cooking Ingredients",
          subSubCategories: [
            { name: "Flavor Extracts(e.g., Vanilla Extract, Almond Extract)" },
            { name: "Oils & Fats(e.g., Olive Oil, Coconut Oil, Ghee)" },
            {
              name: "Baking Ingredients(e.g., Baking Soda, Baking Powder, Yeast)",
            },
          ],
        },
        {
          name: "Ethically Sourced & Organic Products",
          subSubCategories: [
            { name: "Fair Trade Spices" },
            { name: "Organic Condiments" },
            { name: "Locally Sourced Spices & Herbs" },
          ],
        },
        {
          name: "Seasoning for Specific Cuisines",
          subSubCategories: [
            { name: "Indian Seasoning" },
            { name: "Mediterranean Seasoning" },
            { name: "Mexican Seasoning" },
            { name: "Asian Seasoning" },
          ],
        },
        {
          name: "Special Dietary Categories",
          subSubCategories: [
            { name: "Gluten-free Spices" },
            { name: "Vegan Condiments" },
            { name: "Sugar-free Sauces" },
            { name: "Low-Sodium Spices" },
          ],
        },
        {
          name: "Popular Uses",
          subSubCategories: [
            { name: "For Grilling & Barbecue" },
            { name: "For Baking & Desserts" },
            { name: "For Soups & Stews" },
            { name: "Salad Dressings & Dips" },
          ],
        },
      ],
    },
    //Local & Traditional Foods
    {
      name: "Local & Traditional Foods",
      subCategories: [
        {
          name: "Staple Foods",
          subSubCategories: [
            { name: "Rice" },
            { name: "Yam" },
            { name: "Cassava" },
            { name: "Maize" },
            { name: "Plantains" },
            { name: "Millets" },
          ],
        },
        {
          name: "Specialty Grains & Legumes",
          subSubCategories: [
            { name: "Fonio" },
            { name: "Sorghum" },
            { name: "Teff" },
            { name: "Bamara Beans" },
            { name: "Cowpeas" },
          ],
        },
        {
          name: "Traditional Snacks & Street Foods",
          subSubCategories: [
            { name: "Puff-puff" },
            { name: "Samosas" },
            { name: "Empanadas" },
            { name: "Mandazi" },
          ],
        },
        {
          name: "Indigenous Baked Goods",
          subSubCategories: [
            { name: "Flatbreads" },
            { name: "Cornbread " },
            { name: "Meat Pies " },
            { name: "Johnny Cakes" },
          ],
        },
        {
          name: "Traditional Soups & Stews",
          subSubCategories: [
            { name: "Groundnut Soup" },
            { name: "Egusi Soup" },
            { name: "Gumbo" },
            { name: "Bouillabisse" },
          ],
        },
        {
          name: "Fermented & Preserved Foods",
          subSubCategories: [
            { name: "Sauerkraut" },
            { name: "Kimchi" },
            { name: "Fermented Fish" },
            { name: "Pickled Vegetables" },
          ],
        },
        {
          name: "Local Beverages",
          subSubCategories: [
            {
              name: "Non-Alcoholic Drinks(e.g., Hibiscus Tea, Tamarind Juice, Ginger Beer, Palm Wine)",
            },
            {
              name: "Alcoholic Beverages(e.g., Local Spirits, Mead, Traditional Liquors like Tequila, Aguardiente, Sake)",
            },
            {
              name: "Herbal & Medicinal Teas(e.g., Moringa Tea, Rooibos, Bitter Leaf Tea)",
            },
            {
              name: "Coffee & Cocoa Products(e.g., Ethiopian Coffee, Ghanaian Cocoa, Jamaican Blue Mountain Coffee)",
            },
            {
              name: "Specialty Milk & Dairy Products(e.g., Local Goat Milk, Camel Milk, Yogurt Drinks)",
            },
          ],
        },
        {
          name: "Regional & Ethnic Foods",
          subSubCategories: [
            {
              name: "African Cuisine(e.g., Jollof Rice, Injera, Ugali, Bobotie)",
            },
            {
              name: "Caribbean Cuisine(e.g., Ackee & Saltfish, Jerk Chicken, Doubles)",
            },
            {
              name: "Latin American Cuisine(e.g., Arepas, Tacos, Pupusas, Tamales)",
            },
            {
              name: "Middle Eastern Cuisine(e.g., Hummus, Falafel, Manakeesh, Koshari)",
            },
            { name: "Asian Cuisine(e.g., Kimchi, Nasi Goreng, Laksa, Adobo)" },
            {
              name: "European Cuisine(e.g., Pierogi, Moussaka, Paella, Black Pudding)",
            },
          ],
        },
        {
          name: "Ethnic Sauces, Spices & Seasonings",
          subSubCategories: [
            {
              name: "Local Hot Sauces(e.g., Scotch Bonnet Sauce, Harissa, Piri-Piri)",
            },
            {
              name: "Traditional Seasoning Mixes(e.g., Suya Spice, Curry Powder, Adobo Seasoning)",
            },
            {
              name: "Indigenous Spice Blends(e.g., Berbere, Cajun Seasoning, Ras el Hanout)",
            },
            {
              name: "Ethnic Condiments(e.g., Chutney, Fish Sauce, Ghee, Sour Cream)",
            },
          ],
        },
        {
          name: "Culturally Specific Food Categories",
          subSubCategories: [
            { name: "Kosher Foods" },
            { name: "Halal Foods" },
            { name: "Vegan & Vegetarian Options" },
            { name: "Gluten-Free Traditional Foods" },
            {
              name: "Organic & Ethically Sourced Products(e.g., Fair Trade Cocoa, Locally Harvested Grains)",
            },
          ],
        },
        {
          name: "Traditional Sweets & Desserts",
          subSubCategories: [
            {
              name: "Ethnic Desserts(e.g., Turkish Delight, Baklava, Kulfi, Cassava Cake)",
            },
            {
              name: "Indigenous Candies & Treats(e.g., Coconut Sweets, Tamarind Candy, Plantain Chips)",
            },
            {
              name: "Specialty Chocolate & Cocoa Products(e.g., Dark Chocolate Bars, Cocoa Nibs, Artisanal Chocolates)",
            },
          ],
        },
        {
          name: "Packaged & Ready-to-Eat Foods",
          subSubCategories: [
            {
              name: "Ready-to-Eat Traditional Meals(e.g., Canned Jollof Rice, Packaged Tacos, Frozen Samosas)",
            },
            {
              name: "Pre-Packaged Snacks(e.g., Roasted Peanuts, Cassava Chips, Dried Mango)",
            },
            {
              name: "Meal Kits for Traditional Dishes(e.g., Jerk Chicken Kit, Fufu & Soup Kit, Tandoori Chicken Kit)",
            },
          ],
        },
        {
          name: "Traditional Oils & Fats",
          subSubCategories: [
            { name: "Coconut Oil" },
            { name: "Palm Oil" },
            { name: "Groundnut Oil" },
            { name: "Ghee & Clarified Butter" },
            { name: "Olive Oil & Specialty Oils" },
          ],
        },
        {
          name: "Local Grains & Flours",
          subSubCategories: [
            { name: "Cassava Flour" },
            { name: "Yam Flour" },
            { name: "Plantain Flour" },
            { name: "Cornmeal & Maize Flour" },
            { name: "Millet Flour" },
          ],
        },
        {
          name: "Fermented & Pickled Foods",
          subSubCategories: [
            {
              name: "Pickled Vegetables & Fruits(e.g., Pickled Mango, Pickled Peppers)",
            },
            {
              name: "Fermented Fish & Seafood(e.g., Salt Fish, Fermented Shrimp)",
            },
            {
              name: "Sauerkraut & Kimchi(Local variations of fermented dishes)",
            },
          ],
        },
        {
          name: "Cultural Holiday & Festival Foods",
          subSubCategories: [
            {
              name: "Special Holiday Meals(e.g., Thanksgiving Turkey, Eid Lamb, Christmas Ham)",
            },
            {
              name: "Festival Foods(e.g., Diwali Sweets, Ramadan Desserts, Lunar New Year Rice Cakes)",
            },
            {
              name: "Religious & Cultural Feasts(e.g., Passover Foods, Christmas Pudding, Carnival Treats)",
            },
          ],
        },
        {
          name: "Meal Plans & Subscription Boxes",
          subSubCategories: [
            {
              name: "Diaspora Food Subscription Boxes(e.g., African Food Box, Caribbean Meal Box, Asian Cuisine Box)",
            },
            {
              name: "Monthly Traditional Snack Subscription(e.g., Global Snack Box, Heritage Treats Box)",
            },
          ],
        },
      ],
    },
    //Fashion Clothing and Fabrics
    {
      name: "Fashion Clothing and Fabrics",
      subCategories: [
        {
          name: "Traditional Clothing ",
          subSubCategories: [
            {
              name: "Men’s Traditional Wear( e.g., Dashiki, Agbada, Buba, Sokoto, Boubous, Sherwanis, Kimono Kente Cloth)",
            },
            {
              name: "Women’s Traditional Wear( e.g., Kaftans, Kanga, Sari, Abaya, Gele, Kimono )",
            },
            {
              name: "Children’s Traditional Wear( e.g., Dress, Mini Dashikis, Cheongsam, Cultural Dresses )",
            },
            {
              name: "Unisex Traditional Clothing( e.g., Sarongs, Robes, Ponchos, Caftans )",
            },
          ],
        },
        {
          name: "Modern Clothing with Traditional Influence",
          subSubCategories: [
            {
              name: "Contemporary African Fashion( e.g., Ankara Dresses, Adire, Batik Print Designs, Kente-inspired Styles, Dashiki ) ",
            },
            {
              name: "Ethnic-Inspired Urban Wear( e.g., Kimonos with Modern, Fusion Kurtas, Maasai Beadwork Clothing )",
            },
            {
              name: "Fusion Clothing( e.g., Indo-Western Outfits, Afro-Western Styles ) ",
            },
            {
              name: "Custom-Made Ethnic Fashion( e.g., Tailored Kitenge, Custom Embroidered Kaftans )",
            },
          ],
        },
        {
          name: "Footwear & Shoes",
          subSubCategories: [
            {
              name: "Traditional Shoes & Sandals( e.g., Maasai,Sandals, Babouches, Mojaris, Espadrilles",
            },
            {
              name: "Leather & Handmade Shoes(e.g.,Handcrafted Leather Shoes,Moccasins,Traditional Slippers)",
            },
            {
              name: "Modern Shoes with Cultural Designs(e.g., Sneakers, African Prints,Embroidered Flats)",
            },
            {
              name: "Custom Shoes & Sandals(e.g., Ethnic-Inspired Footwear, Made-to-Order Traditional Sandals)",
            },
          ],
        },
        {
          name: "Cultural Accessories & Adornments",
          subSubCategories: [
            {
              name: "Headwear & Scarves(e.g., Turbans, Head Wraps,Geles, Kufi Caps, Hijabs",
            },
            {
              name: "Belts & Sashes(e.g., Kente Sashes,Obi Belts,Traditional Leather Belts)",
            },
            {
              name: "Jewelry & Adornments(e.g., Beaded Necklaces, Waist Beads,Tribal Earrings)",
            },
            {
              name: "Bags & Pouches(e.g., Handmade Leather BagsBeaded Clutches, Cultural Tote Bags)",
            },
          ],
        },
        {
          name: "Fabrics & Textiles",
          subSubCategories: [
            {
              name: "Handwoven & Local Fabrics(e.g., Kente Cloth, Batik Fabrics, Adire, Shweshwe)",
            },
            {
              name: "Printed Fabrics(e.g., Ankara, Wax Prints, African Prints, Ikat )",
            },
            {
              name: "Embroidered & Handmade Textiles(e.g., Aso-Oke, Kantha Stitch, Brocade)",
            },
            {
              name: "Natural & Organic Fabrics(e.g., Cotton, Silk, Wool, Linen)",
            },
          ],
        },
        {
          name: "Cultural Footwear for Specific Occasions",
          subSubCategories: [
            {
              name: "Wedding Footwear(e.g., Bridal Slippers, Beaded Sandals, Embroidered Wedding Shoes)",
            },
            {
              name: "Festival & Ceremony Footwear(e.g., Festival Sandals, Special Occasion Moccasins)",
            },
            {
              name: "Casual Ethnic Footwear(e.g., Beaded Flip-Flops, Everyday Traditional Sandals)",
            },
          ],
        },
        {
          name: "Cultural & Festival Clothing",
          subSubCategories: [
            {
              name: "Wedding Attire(e.g., Traditional Wedding Dresses, Groom's Outfits, Wedding Kente)",
            },
            {
              name: "Festival & Ceremony Outfits(e.g., Eid Outfits, Diwali Sarees, Traditional New Year Costumes)",
            },
            {
              name: "Religious Clothing(e.g., Traditional Muslim Attire, Hindu Wedding Saris, Christian Choir Robes)",
            },
          ],
        },
        {
          name: "Bespoke & Tailored Clothing",
          subSubCategories: [
            {
              name: "Custom Tailored Traditional Wear(e.g., Tailor-made Sherwanis, Custom Gele, Made-to-Measure Dashikis)",
            },
            {
              name: "Made-to-Order Shoes(e.g., Custom Leather Sandals, Handcrafted Cultural Shoes)",
            },
          ],
        },
      ],
    },
    //Traditional and Religious Items
    {
      name: "Traditional and Religious Items",
      subCategories: [
        {
          name: "Religious Artifacts & Symbols",
          subSubCategories: [
            {
              name: "Religious Statues & Idols(e.g., Hindu Deities, Buddha Statues, Christian Crosses, Islamic Calligraphy Art)",
            },
            {
              name: "Sacred Symbols & Talismans(e.g., Hamsa, Nazar (Evil Eye), Om Symbols, Christian Medallions)",
            },
            {
              name: "Holy Books & Scriptures(e.g., Quran, Bible, Bhagavad Gita, Torah)",
            },
            {
              name: "Religious Wall Art & Hangings(e.g., Christian Crosses, Islamic Calligraphy, Hindu Tapestries)",
            },
          ],
        },
        {
          name: "Traditional & Ceremonial Clothing",
          subSubCategories: [
            {
              name: "Religious Attire(e.g., Islamic Abayas and Thobes, Buddhist Robes, Hindu Kurta-Pajamas)",
            },
            {
              name: "Traditional Garments for Ceremonies(e.g., Sari for Weddings, Kente Cloth for Initiation Ceremonies)",
            },
            {
              name: "Headwear & Shawls(e.g., Hijabs, Tallit, Turbans, Dupattas)",
            },
            {
              name: "Religious Robes & Sashes(e.g., Priest Robes, Monk Sashes, Ceremonial Robes)",
            },
          ],
        },
        {
          name: "Religious Jewelry & Adornments",
          subSubCategories: [
            {
              name: "Prayer Beads & Rosaries(e.g., Islamic Tasbih, Catholic Rosaries, Hindu Rudraksha Malas)",
            },
            {
              name: "Amulets & Protective Jewelry(e.g., Hamsa Necklaces, Nazar Bracelets, Talisman Pendants)",
            },
            {
              name: "Religious Rings & Bracelets(e.g., Cross Rings, Sikh Kara Bracelets, Christian Faith Jewelry)",
            },
            {
              name: "Religious Pendants(e.g., Star of David, Om Pendants, Crescent Moon Necklaces)",
            },
          ],
        },
        {
          name: "Altars & Shrines",
          subSubCategories: [
            {
              name: "Home Altars & Prayer Stands(e.g., Hindu Pooja Altars, Buddhist Home Shrines, Catholic Home Altars)",
            },
            {
              name: "Travel Shrines & Portable Altars(e.g., Foldable Prayer Stands, Portable Meditation Shrines)",
            },
            {
              name: "Temple & Religious Centerpieces(e.g., Large Religious Statues, Sacred Figures for Temples)",
            },
          ],
        },
        {
          name: "Ceremonial & Ritual Tools",
          subSubCategories: [
            {
              name: "Incense Burners & Holders(e.g., Brass Incense Holders, Clay Diyas, Incense Towers)",
            },
            {
              name: "Prayer Mats & Cushions(e.g., Islamic Prayer Rugs, Meditation Cushions, Buddhist Mats)",
            },
            {
              name: "Lamps & Candles(e.g., Diwali Lamps, Hanukkah Menorah, Candle Holders for Churches)",
            },
            {
              name: "Ritual Tools(e.g., Hindu Aarti Plates, Tibetan Singing Bowls, Christian Chalices)",
            },
          ],
        },
        {
          name: "Spiritual Healing & Meditation Items",
          subSubCategories: [
            {
              name: "Crystals & Healing Stones(e.g., Quartz, Amethyst, Jade, Mala Beads)",
            },
            {
              name: "Meditation Accessories(e.g., Meditation Cushions, Prayer Beads, Mandalas)",
            },
            {
              name: "Essential Oils & Incense(e.g., Frankincense, Myrrh, Sandalwood, Palo Santo Sticks)",
            },
            {
              name: "Spiritual Books & Guides(e.g., Books on Meditation, Spiritual Guidance Texts)",
            },
          ],
        },
        {
          name: "Cultural & Festive Items",
          subSubCategories: [
            {
              name: "Festival Decorations(e.g., Diwali Diyas, Christmas Ornaments, Ramadan Lanterns)",
            },
            {
              name: "Ceremonial Items(e.g., Wedding Pooja Accessories, Bar/Bat Mitzvah Decorations, Islamic Eid Gifts)",
            },
            {
              name: "Festival Gifts & Hampers(e.g., Rakhi Gift Sets, Christmas Gift Baskets, Ramadan Gifts)",
            },
          ],
        },
        {
          name: "Funeral & Ancestral Veneration Items",
          subSubCategories: [
            {
              name: "Ancestral Shrines(e.g., Chinese Ancestral Shrines, African Ancestral Statues)",
            },
            {
              name: "Funeral Ritual Items(e.g., Incense Burners, Funeral Candles, Prayer Cards)",
            },
            {
              name: "Memorial Jewelry & Keepsakes(e.g., Ash Pendants, Memorial Bracelets, Ancestral Spirit Beads)",
            },
          ],
        },
        {
          name: "Sacred Spaces & Decor",
          subSubCategories: [
            {
              name: "Sacred Furnishings(e.g., Meditation Benches, Religious Seating, Prayer Desks)",
            },
            {
              name: "Religious Wall Decor(e.g., Religious Quotes, Sacred Tapestries, Iconography)",
            },
            {
              name: "Sacred Texts & Calligraphy Art(e.g., Quranic Verses, Biblical Quotes, Sanskrit Script)",
            },
          ],
        },
        {
          name: "Traditional & Religious Crafts",
          subSubCategories: [
            {
              name: "Handcrafted Religious Items(e.g., Cross Stitching, Woven Prayer Mats, Hand-Carved Religious Statues)",
            },
            {
              name: "Cultural Ceremonial Crafts(e.g., Woven Offering Baskets, Clay Diyas, Decorative Candles)",
            },
            {
              name: "Hand-Painted Religious Icons(e.g., Orthodox Icons, Hindu God Paintings, Buddhist Thangka Paintings)",
            },
          ],
        },
      ],
    },
    //Art & Sculptures
    {
      name: "Art & Sculptures",
      subCategories: [
        {
          name: "Paintings",
          subSubCategories: [
            { name: "Abstract & Expressionist" },
            { name: "Cultural & Tribal Art" },
            { name: "Nature & Landscape" },
            { name: "Portraits & Figurative" },
          ],
        },
        {
          name: "Wall Art",
          subSubCategories: [
            { name: "Murals" },
            { name: "Tapestries" },
            { name: "Framed Fabric Art" },
          ],
        },
        {
          name: "Sculptures",
          subSubCategories: [
            { name: "Wood Carvings" },
            { name: "Bronze & Metal Sculptures" },
            { name: "Clay & Terracotta Figurines" },
            { name: "Stone Carvings" },
          ],
        },
        {
          name: "Traditional Crafts",
          subSubCategories: [
            { name: "Beaded Art" },
            { name: "Raffia & Bamboo Work" },
            { name: "Gourd Art" },
            { name: "Rope & Thread Work" },
          ],
        },
        {
          name: "Religious & Ritual Art",
          subSubCategories: [
            { name: "Spiritual Figures" },
            { name: "Shrine Accessories" },
          ],
        },
      ],
    },
    //Music & Beats
    {
      name: "Music & Beats",
      subCategories: [
        {
          name: "Traditional Instruments(Physical Products)",
          subSubCategories: [
            { name: "Talking Drums & Bata" },
            { name: "Kalimba & Thumb Piano" },
            { name: "Djembe & Conga" },
            { name: "Flutes & Horns" },
          ],
        },
        {
          name: "Beats & Audio Downloads",
          subSubCategories: [
            { name: "African Percussion Loops" },
            { name: "Afrobeat/Highlife Instrumentals" },
            { name: "Ethnic and Cultural Music Tracks" },
          ],
        },
        {
          name: "Albums & EPs",
          subSubCategories: [
            { name: "Local Folk Music Albums" },
            { name: "Contemporary Afro-Traditional Mixes" },
          ],
        },
        {
          name: "Live Performance Bookings",
          subSubCategories: [
            { name: "Local Musicians" },
            { name: "Cultural Troupes" },
          ],
        },
      ],
    },
    //Drama, Plays & Short Skits
    {
      name: "Drama, Plays & Short Skits",
      subCategories: [
        {
          name: "Music & Beats",
          subSubCategories: [
            { name: "Beats & Instrumentals(MP3)" },
            { name: "Albums & Songs(Digital)" },
            { name: "Physiacl Instruments" },
          ],
        },
        {
          name: "Drama & Skits",
          subSubCategories: [
            {
              name: "Scripts & Manuscripts(PDF/Doc)(e.g Cultural plays, Festival performances, Moral & Satirical Skits)",
            },
            { name: "Recorded Performances(MP4/Streaming)" },
            { name: "Folks and storytelling session" },
            { name: "Live Performances / Booking" },
          ],
        },
        {
          name: "Educational Packs",
          subSubCategories: [
            { name: "Drama Kits for Schools" },
            { name: "Community Theatre Scripts" },
            { name: "Language Preservation Plays" },
          ],
        },
      ],
    },
    //Handmade Furniture
    {
      name: "Handmade Furniture",
      subCategories: [
        {
          name: "Seating",
          subSubCategories: [
            { name: "Traditional Stools" },
            { name: "Hand-carved Benches" },
            { name: "Raffia/Cane Chairs" },
          ],
        },
        {
          name: "Tables",
          subSubCategories: [
            { name: "Low Tables & Coffee Tables" },
            { name: "Hand-painted Dining Tables" },
          ],
        },
        {
          name: "Storage",
          subSubCategories: [
            { name: "Woven Baskets With Lids" },
            { name: "Wooden Chests & Cabinets" },
          ],
        },
        {
          name: "Bedroom Items",
          subSubCategories: [
            { name: "Bed Frames(Hand-carved)" },
            { name: "Side Stools & Nightstands" },
          ],
        },
        {
          name: "Decor & Utility",
          subSubCategories: [
            { name: "Room Dividers" },
            { name: "Wall Shelves" },
            { name: "Candle Stands & Artful Lamps" },
          ],
        },
        {
          name: "Outdoor & Patio",
          subSubCategories: [
            { name: "Palm Furniture Sets" },
            { name: "Bamboo Loungers" },
          ],
        },
      ],
    },
    //Vintage & Antigue Jewelry
    {
      name: "Vintage & Antigue Jewelry",
      subCategories: [
        {
          name: "Vintage Jewelry",
          subSubCategories: [
            { name: "Handcrafted Beaded Necklaces" },
            { name: "Antique Silver Rings" },
            { name: "Raffia/Cane Chairs" },
            { name: "Tribal Earrings" },
            { name: "Vintage Cuff Bracelets" },
            { name: "Ethnic Pendants" },
          ],
        },
        {
          name: "Religious and Spiritual Jewelry",
          subSubCategories: [
            { name: "Prayer Beads" },
            { name: "Symbolic Pendants" },
            { name: "Chakra Jewelry" },
            { name: "Healing Crystal Jewelry" },
          ],
        },
        {
          name: "Cultural Gemstones",
          subSubCategories: [
            { name: "Turquoise" },
            { name: "Amber" },
            { name: "Coral" },
            { name: "Onyx" },
          ],
        },
        {
          name: "Festive and Ritual Jewelry",
          subSubCategories: [
            { name: "Wedding Jewelry" },
            { name: "Festival Jewelry" },
            { name: "Ritual Adornments" },
            { name: "Crowning and Headpieces" },
          ],
        },
      ],
    },
    //Traditional Musical Instruments (Religious & Ceremonial)
    {
      name: "Traditional Musical Instruments(Religious & Ceremonial)",
      subCategories: [
        {
          name: "Drums & Percussion(e.g., African Djembe Drums, Indian Tabla, Ceremonial Bongos)",
          subSubCategories: [
            {
              name: "Wind Instruments(e.g., Tibetan Horns, Shofar, Native American Flutes)",
            },
            { name: "String Instruments(e.g., Sitar, Harps, Tambura)" },
            {
              name: "Bells & Chimes(e.g., Buddhist Temple Bells, Prayer Chimes, Tibetan Bells)",
            },
          ],
        },
        {
          name: "Ritual Offerings & Sacramental Items",
          subSubCategories: [
            {
              name: "Holy Water Containers & Fonts(e.g., Christian Holy Water Fonts, Hindu Water Pots (Kalash))",
            },
            {
              name: "Offering Bowls & Plates(e.g., Tibetan Offering Bowls, Indian Ritual Plates (Thalis))",
            },
          ],
        },
        {
          name: "Sacramental Wine & Chalices(e.g., Communion Chalices, Seder Cups)",
          subSubCategories: [
            {
              name: "Funeral & Ancestral Veneration Items",
            },
            {
              name: "Ancestral Shrines(e.g., Chinese Ancestral Shrines, African Ancestral Statues)",
            },
          ],
        },
        {
          name: "Funeral Ritual Items(e.g., Incense Burners, Funeral Candles, Prayer Cards)",
          subSubCategories: [
            {
              name: "Memorial Jewelry & Keepsakes(e.g., Ash Pendants, Memorial Bracelets, Ancestral Spirit Beads)",
            },
            { name: "Sacred Spaces & Decor" },
            {
              name: "Sacred Furnishings(e.g., Meditation Benches, Religious Seating, Prayer Desks)",
            },
            {
              name: "Religious Wall Decor(e.g., Religious Quotes, Sacred Tapestries, Iconography)",
            },
            {
              name: "Sacred Texts & Calligraphy Art(e.g., Quranic Verses, Biblical Quotes, Sanskrit Script)",
            },
            { name: "Traditional & Religious Crafts" },
            {
              name: "Handcrafted Religious Items(e.g., Cross Stitching, Woven Prayer Mats, Hand-Carved Religious Statues)",
            },
            {
              name: "Cultural Ceremonial Crafts(e.g., Woven Offering Baskets, Clay Diyas, Decorative Candles)",
            },
            {
              name: "Hand-Painted Religious Icons(e.g., Orthodox Icons, Hindu God Paintings, Buddhist Thangka Paintings)",
            },
          ],
        },
      ],
    },
    //Local Food and Drinks Products
    {
      name: "Local Food and Drinks Products",
      subCategories: [
        {
          name: "Traditional Snacks & Sweets(e.g., Local Pastries, Regional Confections, Traditional Candies)",
          subSubCategories: [
            {
              name: "Canned & Preserved Foods(e.g., Pickles, Jams, Regional Sauces)",
            },
            {
              name: "Spices & Seasonings(e.g., Local Spice Blends, Specialty Salts, Traditional Marinades)",
            },
            {
              name: "Sauces & Condiments(e.g., Chutneys, Hot Sauces, Dipping Sauces)",
            },
            {
              name: "Dried Fruits & Nuts(e.g., Local Dried Fruits, Specialty Nuts, Trail Mixes)",
            },
          ],
        },
        {
          name: "Beverages",
          subSubCategories: [
            {
              name: "Local Soft Drinks & Juices(e.g., Local Fruit Juices, Traditional Sodas, Herbal Drinks)",
            },
          ],
        },
        {
          name: "Alcoholic Beverages",
          subSubCategories: [
            {
              name: "Wine(e.g., Local Wines, Craft Beers, Traditional Spirits)",
            },
          ],
        },
        {
          name: "Specialty Teas(e.g., Herbal Teas, Traditional Loose Leaf Teas, Specialty Blends)",
          subSubCategories: [
            {
              name: "Coffee & Coffee Products(e.g., Local Coffee Beans, Instant Coffee, Specialty Blends)",
            },
            {
              name: "Infused Waters & Health Drinks(e.g., Infused Herbal Waters, Nutritional Drinks)",
            },
          ],
        },
        {
          name: "Tea Products",
          subSubCategories: [
            {
              name: "Loose Leaf Teas(e.g., Local Black Tea, Green Tea, Herbal Infusions)",
            },
            {
              name: "Tea Bags & Pyramid Bags(e.g., Specialty Tea Bags, Traditional Pyramid Tea Bags)",
            },
          ],
        },
        {
          name: "Traditional Tea Sets & Accessories",
          subSubCategories: [
            {
              name: "Tea(e.g., Tea Pots, Cups, Tea Infusers)",
            },
          ],
        },
        {
          name: "Sweeteners & Additives(e.g., Local Honey, Sugar Alternatives, Flavor Syrups)",
          subSubCategories: [
            {
              name: "Tea Blends & Specialty Mixes(e.g., Chai Mixes, Fruit Tea Blends, Medicinal Herbal Teas)",
            },
          ],
        },
        {
          name: "Culinary Ingredients",
          subSubCategories: [
            {
              name: "Grains & Legumes(e.g., Local Rice Varieties, Lentils, Specialty Beans)",
            },
            {
              name: "Oils & Fats(e.g., Local Cooking Oils, Specialty Butter, Ghee)",
            },
            {
              name: "Fresh Produce & Herbs(e.g., Locally Grown Vegetables, Fresh Herbs)",
            },
            {
              name: "Baking Supplies(e.g., Local Flours, Yeast, Baking Mixes)",
            },
            {
              name: "Specialty Foods(e.g., Local Cheese, Regional Meats, Traditional Bread)",
            },
            {
              name: "Meal Kits & Ready-to-Eat Products",
            },
            {
              name: "Regional Meal Kits(e.g., Local Cuisine Cooking Kits, Spice Kits)",
            },
            {
              name: "Frozen & Prepared Meals(e.g., Frozen Local Dishes, Ready-to-Eat Meals)",
            },
            {
              name: "Soups & Broths(e.g., Traditional Soups, Bone Broths, Herbal Broths",
            },
          ],
        },
      ],
    },
  ],
}: CategorySelectorProps) {
  const isUpgraded =
    vendorPlan === "Shelves" ||
    vendorPlan === "Counter" ||
    vendorPlan === "Shop" ||
    vendorPlan === "Premium";
  const user = useSelector((state: RootState) => state.vendor);
  const {} = useQuery({
    queryKey: ["vendor"],
    queryFn: () => get_single_vendor(user.token),
  });

  // Use the activeCategory passed from parent (which gets updated from dropdown selection)
  const currentCategory = activeCategory;
  const activeCategoryObj = categoryData.find(
    (cat) => cat.name === currentCategory
  );

  // Reset subcategory and sub-subcategory when active category changes
  useEffect(() => {
    if (onCategorySelect && currentCategory) {
      // Find the first subcategory for the new category
      const firstSubCategory =
        activeCategoryObj?.subCategories?.[0]?.name || "";
      setSelectedSubCategory(firstSubCategory);
      setSelectedSubSubCategory("");
    }
  }, [
    currentCategory,
    activeCategoryObj,
    setSelectedSubCategory,
    setSelectedSubSubCategory,
    onCategorySelect,
  ]);

  // Reset sub-subcategory when subcategory changes
  useEffect(() => {
    setSelectedSubSubCategory("");
  }, [selectedSubCategory, setSelectedSubSubCategory]);

  // If vendor hasn't upgraded, show the dropdown filter
  if (!isUpgraded) {
    return (
      <div className="relative">
        <motion.select
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={currentCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          disabled // Disable for non-upgraded vendors to prevent changing category
        >
          <option value="">Filter by Category</option>
          {selectedCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </motion.select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    );
  }

  // For upgraded vendors, show the new category selection UI
  return (
    <div className="bg-white p-4 sm:p-5 rounded-lg shadow w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Category</h2>
      <div className="border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Main Category */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Product Category</label>
          <motion.input
            type="text"
            className="w-full p-3 border rounded-lg bg-gray-100 text-sm sm:text-base"
            value={currentCategory}
            readOnly
          />
        </div>

        {/* Subcategory Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">{currentCategory}</label>
          <div className="relative">
            <motion.select
              className="w-full p-3 border rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
            >
              <option value="">Select Subcategory</option>
              {activeCategoryObj?.subCategories.map((subCat) => (
                <option key={subCat.name} value={subCat.name}>
                  {subCat.name}
                </option>
              ))}
            </motion.select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Sub-subcategory Selection */}
        {selectedSubCategory && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {selectedSubCategory}
            </label>
            <div className="relative">
              <motion.select
                className="w-full p-3 border rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                value={selectedSubSubCategory}
                onChange={(e) => setSelectedSubSubCategory(e.target.value)}
              >
                <option value="">Select {selectedSubCategory} Type</option>
                {activeCategoryObj?.subCategories
                  .find((subCat) => subCat.name === selectedSubCategory)
                  ?.subSubCategories.map((subSubCat) => (
                    <option key={subSubCat.name} value={subSubCat.name}>
                      {subSubCat.name}
                    </option>
                  ))}
              </motion.select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
