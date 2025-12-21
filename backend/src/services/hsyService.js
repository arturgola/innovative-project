const axios = require("axios");
const {
  HSY_WASTE_API_URL,
  HSY_CACHE_DURATION,
} = require("../../config/constants");
const { getHSYHeaders } = require("../utils/helpers");

class HSYService {
  constructor() {
    this.hsyWasteGuideCache = null;
    this.hsyCacheTimestamp = null;
  }

  /**
   * Fetch HSY waste guide list and cache it
   */
  async getHSYWasteGuideList() {
    try {
      const now = Date.now();
      if (
        this.hsyWasteGuideCache &&
        this.hsyCacheTimestamp &&
        now - this.hsyCacheTimestamp < HSY_CACHE_DURATION
      ) {
        console.log("Using cached HSY waste guide data");
        return this.hsyWasteGuideCache;
      }

      console.log("Fetching fresh HSY waste guide data...");
      const headers = getHSYHeaders();

      console.log("Fetching with original URL:", HSY_WASTE_API_URL);

      const response = await axios.get(HSY_WASTE_API_URL, {
        timeout: 15000,
        headers: headers,
      });

      const responseData = response.data;
      console.log("HSY API response structure:", Object.keys(responseData));
      console.log(
        "Total count from API:",
        responseData.total || responseData.totalCount || "unknown"
      );

      let allWasteItems = responseData.hits || responseData;
      console.log(`Got ${allWasteItems.length} items from first request`);

      if (!Array.isArray(allWasteItems)) {
        console.warn(
          "HSY API response hits is not an array:",
          typeof allWasteItems
        );
        console.log("Full response data:", responseData);
        return [];
      }

      const totalCount = responseData.total || responseData.totalCount;
      if (totalCount && totalCount > allWasteItems.length) {
        console.log(
          `API indicates ${totalCount} total items, but we only got ${allWasteItems.length}. Fetching all items...`
        );

        allWasteItems = await this.fetchAllPages(
          allWasteItems,
          totalCount,
          headers
        );
      }

      const uniqueItems = this.removeDuplicates(allWasteItems);
      const simplifiedItems = this.simplifyItems(uniqueItems);

      console.log(
        `Cached ${simplifiedItems.length} HSY waste guide items (${uniqueItems.length} unique items, ${allWasteItems.length} total before deduplication)`
      );

      this.hsyWasteGuideCache = simplifiedItems;
      this.hsyCacheTimestamp = now;

      return simplifiedItems;
    } catch (error) {
      console.error("Error fetching HSY waste guide data:", error.message);

      if (error.response) {
        console.error("HSY API Response Status:", error.response.status);
        console.error("HSY API Response Data:", error.response.data);
      }

      if (this.hsyWasteGuideCache) {
        console.log("Using stale cached HSY data due to API error");
        return this.hsyWasteGuideCache;
      }

      return [];
    }
  }

  /**
   * Fetch all pages of HSY data
   */
  async fetchAllPages(initialItems, totalCount, headers) {
    const itemsPerPage = initialItems.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    console.log(
      `Need to fetch ${totalPages} pages to get all ${totalCount} items`
    );

    const paginationFormats = [
      (page) => `${HSY_WASTE_API_URL}&page=${page}`,
      (page) => `${HSY_WASTE_API_URL}&offset=${page * itemsPerPage}`,
      (page) => `${HSY_WASTE_API_URL}&from=${page * itemsPerPage}`,
      (page) => `${HSY_WASTE_API_URL}&skip=${page * itemsPerPage}`,
      (page) => `${HSY_WASTE_API_URL}&start=${page * itemsPerPage}`,
    ];

    let successfulFormat = await this.findWorkingPaginationFormat(
      paginationFormats,
      headers
    );

    if (!successfulFormat) {
      console.log(
        `❌ No working pagination format found. Using ${initialItems.length} items from first request only.`
      );
      return initialItems;
    }

    return await this.fetchRemainingPages(
      initialItems,
      totalPages,
      totalCount,
      successfulFormat,
      headers
    );
  }

  /**
   * Find working pagination format
   */
  async findWorkingPaginationFormat(paginationFormats, headers) {
    for (const formatFunc of paginationFormats) {
      try {
        const testUrl = formatFunc(2);
        console.log(`Testing pagination format: ${testUrl}`);

        const testResponse = await axios.get(testUrl, {
          timeout: 10000,
          headers: headers,
        });

        const testData = testResponse.data;
        const testItems = testData.hits || testData;

        if (Array.isArray(testItems) && testItems.length > 0) {
          console.log(
            `✅ Found working pagination format! Got ${testItems.length} items`
          );
          return formatFunc;
        }
      } catch (testError) {
        console.log(
          `❌ Format failed: ${testError.response?.status || testError.message}`
        );
      }
    }
    return null;
  }

  /**
   * Fetch remaining pages using successful format
   */
  async fetchRemainingPages(
    allWasteItems,
    totalPages,
    totalCount,
    successfulFormat,
    headers
  ) {
    console.log(`Fetching remaining pages using successful format...`);

    const seenIds = new Set(allWasteItems.map((item) => item.id));

    for (let page = 2; page <= Math.min(totalPages, 35); page++) {
      try {
        const pageUrl = successfulFormat(page);
        console.log(
          `Fetching page ${page}/${Math.min(totalPages, 35)}: ${pageUrl}`
        );

        const pageResponse = await axios.get(pageUrl, {
          timeout: 10000,
          headers: headers,
        });

        const pageData = pageResponse.data;
        const pageItems = pageData.hits || pageData;

        if (Array.isArray(pageItems) && pageItems.length > 0) {
          const newItems = pageItems.filter((item) => {
            if (seenIds.has(item.id)) {
              return false;
            }
            seenIds.add(item.id);
            return true;
          });

          if (newItems.length > 0) {
            allWasteItems = [...allWasteItems, ...newItems];
            console.log(
              `  ✅ Got ${newItems.length} new items (${
                pageItems.length - newItems.length
              } duplicates filtered, total: ${allWasteItems.length})`
            );
          } else {
            console.log(`  ⚠️ All items were duplicates, stopping pagination`);
            break;
          }
        } else {
          console.log(`  ⚠️ No more items found, stopping pagination`);
          break;
        }

        if (allWasteItems.length >= totalCount) {
          console.log(
            `  ✅ Reached expected total count of ${totalCount}, stopping pagination`
          );
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (pageError) {
        console.error(
          `  ❌ Error fetching page ${page}: ${
            pageError.response?.status || pageError.message
          }`
        );
      }
    }

    console.log(
      `✅ Pagination complete! Fetched ${allWasteItems.length} total items (expected: ${totalCount})`
    );
    return allWasteItems;
  }

  /**
   * Remove duplicate items by ID
   */
  removeDuplicates(items) {
    const uniqueItems = items.filter(
      (item, index, array) =>
        array.findIndex((otherItem) => otherItem.id === item.id) === index
    );

    if (uniqueItems.length !== items.length) {
      console.log(
        `⚠️ Removed ${
          items.length - uniqueItems.length
        } duplicate items in final cleanup`
      );
    }

    return uniqueItems;
  }

  /**
   * Simplify items to only include necessary fields
   */
  simplifyItems(items) {
    return items
      .map((item) => ({
        id: item.id,
        title: item.title || "",
        synonyms: item.synonyms || [],
      }))
      .filter((item) => item.title && item.id);
  }

  /**
   * Fetch detailed waste guide item by ID
   */
  async getHSYWasteGuideDetails(wasteGuideId) {
    try {
      console.log(`Fetching HSY waste guide details for ID: ${wasteGuideId}`);

      const headers = getHSYHeaders();
      const detailUrl = `https://dev.klapi.hsy.fi/int2001/v1/waste-guide-api/waste-pages/${wasteGuideId}?lang=en`;

      const response = await axios.get(detailUrl, {
        timeout: 10000,
        headers: headers,
      });

      console.log(
        `✅ Successfully fetched details for HSY item: "${response.data.title}"`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching HSY waste guide details for ID ${wasteGuideId}:`,
        error.message
      );

      if (error.response) {
        console.error("HSY API Response Status:", error.response.status);
        console.error("HSY API Response Data:", error.response.data);
      }

      return null;
    }
  }

  /**
   * Get cache info
   */
  getCacheInfo() {
    return {
      itemCount: this.hsyWasteGuideCache ? this.hsyWasteGuideCache.length : 0,
      items: this.hsyWasteGuideCache || [],
      cacheTimestamp: this.hsyCacheTimestamp,
      cacheAge: this.hsyCacheTimestamp
        ? Date.now() - this.hsyCacheTimestamp
        : null,
    };
  }

  /**
   * Search cached items
   */
  searchCachedItems(searchTerm) {
    if (!this.hsyWasteGuideCache) {
      return [];
    }

    const term = searchTerm.toLowerCase();
    return this.hsyWasteGuideCache.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(term);
      const synonymMatch = item.synonyms.some((synonym) =>
        synonym.toLowerCase().includes(term)
      );
      return titleMatch || synonymMatch;
    });
  }
}

module.exports = new HSYService();
