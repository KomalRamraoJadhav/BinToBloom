namespace BinToBloom_Backend.Models.DTOs
{
    public class GlobalAnalyticsDto
    {
        public decimal TotalWaste { get; set; }
        public int TotalPickups { get; set; }
        public int CompletedPickups { get; set; }
        public Dictionary<string, decimal> WasteByType { get; set; } = new();
        public Dictionary<string, int> CityWisePickups { get; set; } = new();
        public Dictionary<string, decimal> CityWiseWaste { get; set; } = new();
    }

    public class SpecificCityAnalyticsDto
    {
        public string City { get; set; }
        public decimal TotalWaste { get; set; }
        public int TotalPickups { get; set; }
        public Dictionary<string, decimal> WasteByType { get; set; } = new();
    }
}
